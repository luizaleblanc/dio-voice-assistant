package dio.budgeting.infrastructure.http;

import dio.budgeting.application.ClearTransactionsUseCase;
import dio.budgeting.application.GetTotalByCategoryUseCase;
import dio.budgeting.application.ListTransactionsByCategoryUseCase;
import dio.budgeting.application.PersistTransactionUseCase;
import dio.budgeting.application.output.TransactionOutput;
import dio.budgeting.domain.Category;
import dio.budgeting.infrastructure.http.request.TransactionRequest;
import dio.budgeting.infrastructure.http.response.TransactionResponse;
import org.springframework.ai.chat.client.ChatClient;
import dio.budgeting.infrastructure.http.response.CategorySummary;
import dio.budgeting.infrastructure.http.response.DashboardSummaryResponse;
import java.util.ArrayList;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.openai.OpenAiAudioSpeechModel;
import org.springframework.ai.openai.OpenAiAudioSpeechOptions;
import org.springframework.ai.openai.OpenAiAudioTranscriptionModel;
import org.springframework.ai.openai.OpenAiAudioTranscriptionOptions;
import org.springframework.ai.openai.api.OpenAiAudioApi;
import org.springframework.ai.openai.audio.speech.SpeechPrompt;
import org.springframework.ai.openai.audio.transcription.AudioTranscriptionPrompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final PersistTransactionUseCase persistTransactionUseCase;
    private final ListTransactionsByCategoryUseCase listTransactionsByCategoryUseCase;
    private final GetTotalByCategoryUseCase getTotalByCategoryUseCase;
    private final ClearTransactionsUseCase clearTransactionsUseCase;
    private final ChatClient chatClient;
    private final OpenAiAudioTranscriptionModel transcriptionModel;
    private final OpenAiAudioSpeechModel speechModel;
    private final ChatMemory chatMemory;

    public TransactionController(PersistTransactionUseCase persistTransactionUseCase,
                                 ListTransactionsByCategoryUseCase listTransactionsByCategoryUseCase,
                                 GetTotalByCategoryUseCase getTotalByCategoryUseCase,
                                 ClearTransactionsUseCase clearTransactionsUseCase,
                                 @Value("classpath:prompts/system-message.st") Resource systemPrompt,
                                 ChatClient.Builder chatClientBuilder,
                                 OpenAiAudioTranscriptionModel transcriptionModel,
                                 OpenAiAudioSpeechModel speechModel) throws IOException {
        this.persistTransactionUseCase = persistTransactionUseCase;
        this.listTransactionsByCategoryUseCase = listTransactionsByCategoryUseCase;
        this.getTotalByCategoryUseCase = getTotalByCategoryUseCase;
        this.clearTransactionsUseCase = clearTransactionsUseCase;
        this.transcriptionModel = transcriptionModel;
        this.speechModel = speechModel;
        this.chatMemory = new InMemoryChatMemory();
        this.chatClient = chatClientBuilder
                .defaultSystem(systemPrompt.getContentAsString(Charset.defaultCharset()))
                .defaultFunctions("persistTransactionUseCase", "listTransactionsByCategoryUseCase", "getTotalByCategoryUseCase")
                .build();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse createTransaction(@RequestBody TransactionRequest request) {
        var transaction = persistTransactionUseCase.execute(request.toInput());
        return TransactionResponse.from(transaction);
    }

    @GetMapping("/{category}")
    public List<TransactionResponse> readTransactions(@PathVariable Category category) {
        return listTransactionsByCategoryUseCase.execute(category).stream().map(TransactionResponse::from).toList();
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearTransactions() {
        clearTransactionsUseCase.execute();
    }

   
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Double>> getDashboardSummary() {
        Map<String, Double> summary = new HashMap<>();

        for (Category category : Category.values()) {
            double total = listTransactionsByCategoryUseCase.execute(category).stream()
                    .mapToDouble(TransactionOutput::value)
                    .sum();

            if (total > 0) {
                summary.put(category.name(), total);
            }
        }
        return ResponseEntity.ok(summary);
    }

    @PostMapping(value = "/ai", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = "audio/mpeg")
    public ResponseEntity<byte[]> processAudioCommand(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "sessionId", defaultValue = "default-session") String sessionId) throws IOException {

        byte[] responseAudio = processVoiceCommand(file.getResource(), sessionId);
        return ResponseEntity.ok(responseAudio);
    }

     @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryResponse> getDashboard() {
        List<CategorySummary> categorySummaries = new ArrayList<>();
        List<TransactionOutput> allTransactions = new ArrayList<>();
        double totalSpent = 0;
        String currency = "BRL";

        for (Category category : Category.values()) {
            List<TransactionOutput> outputs = listTransactionsByCategoryUseCase.execute(category);
            if (outputs.isEmpty()) {
                continue;
            }

            double categoryTotal = outputs.stream().mapToDouble(TransactionOutput::value).sum();
            totalSpent += categoryTotal;
            currency = outputs.get(0).currency();

            categorySummaries.add(new CategorySummary(category.name(), categoryTotal, currency, outputs.size(), 0));
            allTransactions.addAll(outputs);
        }

        double finalTotal = totalSpent;
        List<CategorySummary> withPercentages = categorySummaries.stream()
                .map(c -> new CategorySummary(c.category(), c.total(), c.currency(), c.count(),
                        finalTotal > 0 ? (c.total() / finalTotal) * 100 : 0))
                .toList();

        return ResponseEntity.ok(new DashboardSummaryResponse(totalSpent, currency, withPercentages, allTransactions));
    }

    @PostMapping(value = "/ai-base64", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> processAiTransactionBase64(@RequestBody Map<String, String> payload) {
        try {
            String base64Audio = payload.get("audioBase64");
            String sessionId = payload.getOrDefault("sessionId", "default-session");

            byte[] audioBytes = Base64.getDecoder().decode(base64Audio);
            Resource audioResource = new ByteArrayResource(audioBytes) {
                @Override
                public String getFilename() {
                    return "voice-command.webm";
                }
            };

            byte[] responseAudio = processVoiceCommand(audioResource, sessionId);
            String responseBase64 = Base64.getEncoder().encodeToString(responseAudio);

            return ResponseEntity.ok(Map.of("audioBase64", responseBase64));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao processar áudio: " + e.getMessage());
        }
    }

    private byte[] processVoiceCommand(Resource audioResource, String sessionId) {
        var transcriptionOptions = OpenAiAudioTranscriptionOptions.builder()
                .withLanguage("pt")
                .build();
        var transcriptionPrompt = new AudioTranscriptionPrompt(audioResource, transcriptionOptions);
        String userText = transcriptionModel.call(transcriptionPrompt).getResult().getOutput();

        String promptPersonalizado = userText + " (Obrigatório: Responda em português do Brasil de forma amigável e natural informando o resultado da operação).";

        String aiTextResponse = chatClient.prompt()
                .user(promptPersonalizado)
                .advisors(new MessageChatMemoryAdvisor(this.chatMemory, sessionId, 10))
                .call()
                .content();

        var speechOptions = OpenAiAudioSpeechOptions.builder()
                .withModel("tts-1")
                .withVoice(OpenAiAudioApi.SpeechRequest.Voice.NOVA)
                .withResponseFormat(OpenAiAudioApi.SpeechRequest.AudioResponseFormat.MP3)
                .withSpeed(1.0f)
                .build();
        var speechPrompt = new SpeechPrompt(aiTextResponse, speechOptions);

        return speechModel.call(speechPrompt).getResult().getOutput();
    }
}