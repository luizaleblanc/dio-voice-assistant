package dio.budgeting.infrastructure.http;

import dio.budgeting.application.GetTotalByCategoryUseCase;
import dio.budgeting.application.ListTransactionsByCategoryUseCase;
import dio.budgeting.application.PersistTransactionUseCase;
import dio.budgeting.domain.Category;
import dio.budgeting.domain.Transaction;
import dio.budgeting.infrastructure.http.request.TransactionRequest;
import dio.budgeting.infrastructure.http.response.TransactionResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.openai.OpenAiAudioSpeechModel;
import org.springframework.ai.openai.OpenAiAudioTranscriptionModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.Charset;
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
    private final ChatClient chatClient;
    private final OpenAiAudioTranscriptionModel transcriptionModel;
    private final OpenAiAudioSpeechModel speechModel;
    private final ChatMemory chatMemory;

    public TransactionController(PersistTransactionUseCase persistTransactionUseCase,
                                 ListTransactionsByCategoryUseCase listTransactionsByCategoryUseCase,
                                 GetTotalByCategoryUseCase getTotalByCategoryUseCase,
                                 @Value("classpath:prompts/system-message.st") Resource systemPrompt,
                                 ChatClient.Builder chatClientBuilder,
                                 OpenAiAudioTranscriptionModel transcriptionModel,
                                 OpenAiAudioSpeechModel speechModel) throws IOException {
        this.persistTransactionUseCase = persistTransactionUseCase;
        this.listTransactionsByCategoryUseCase = listTransactionsByCategoryUseCase;
        this.getTotalByCategoryUseCase = getTotalByCategoryUseCase;
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

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Double>> getDashboardSummary() {
        Map<String, Double> summary = new HashMap<>();
        
        for (Category category : Category.values()) {
            double total = listTransactionsByCategoryUseCase.execute(category).stream()
                    .mapToDouble(output -> output.value()) 
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
            @RequestParam(value = "sessionId", defaultValue = "default-session") String sessionId) {
        
        String userText = transcriptionModel.call(file.getResource());
        String promptPersonalizado = userText + " (Obrigatório: Responda em português do Brasil de forma amigável e natural informando o resultado da operação).";
        
        String aiTextResponse = chatClient.prompt()
                .user(promptPersonalizado)
                .advisors(new MessageChatMemoryAdvisor(this.chatMemory, sessionId, 10))
                .call()
                .content();
        
        byte[] audioBytes = speechModel.call(aiTextResponse);
        return ResponseEntity.ok(audioBytes);
    }
}