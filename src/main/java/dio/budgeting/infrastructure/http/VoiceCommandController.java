package dio.budgeting.infrastructure.http;

import org.springframework.ai.chat.client.ChatClient;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/transactions")
public class VoiceCommandController {

    private final ChatClient chatClient;
    private final OpenAiAudioTranscriptionModel transcriptionModel;
    private final OpenAiAudioSpeechModel speechModel;
    private final ChatMemory chatMemory;

    public VoiceCommandController(@Value("classpath:prompts/system-message.st") Resource systemPrompt,
                                   ChatClient.Builder chatClientBuilder,
                                   OpenAiAudioTranscriptionModel transcriptionModel,
                                   OpenAiAudioSpeechModel speechModel) throws IOException {
        this.transcriptionModel = transcriptionModel;
        this.speechModel = speechModel;
        this.chatMemory = new InMemoryChatMemory();
        this.chatClient = chatClientBuilder
                .defaultSystem(systemPrompt.getContentAsString(Charset.defaultCharset()))
                .defaultFunctions("persistTransactionUseCase", "listTransactionsByCategoryUseCase", "getTotalByCategoryUseCase")
                .build();
    }

    @PostMapping(value = "/ai", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = "audio/mpeg")
    public ResponseEntity<byte[]> processAudioCommand(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "sessionId", defaultValue = "default-session") String sessionId) throws IOException {

        byte[] responseAudio = processVoiceCommand(file.getResource(), sessionId);
        return ResponseEntity.ok(responseAudio);
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
