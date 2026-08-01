package dio.budgeting.infrastructure.http;

import dio.budgeting.domain.User;
import dio.budgeting.domain.UserRepository;
import dio.budgeting.infrastructure.http.dto.AuthenticationDTO;
import dio.budgeting.infrastructure.http.dto.LoginResponseDTO;
import dio.budgeting.infrastructure.http.dto.RegisterDTO;
import dio.budgeting.infrastructure.security.TokenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           TokenService tokenService,
                           PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());

        var auth = this.authenticationManager.authenticate(usernamePassword);

        var email = ((UserDetails) auth.getPrincipal()).getUsername();
        var token = tokenService.generateToken(email);

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid RegisterDTO data) {
        if (this.userRepository.findByEmail(data.email()).isPresent()) {
            return ResponseEntity.badRequest().body("E-mail já cadastrado!");
        }

        String encryptedPassword = passwordEncoder.encode(data.password());
        User newUser = new User(data.email(), encryptedPassword);

        this.userRepository.save(newUser);

        return ResponseEntity.ok("Usuário cadastrado com sucesso!");
    }
}
