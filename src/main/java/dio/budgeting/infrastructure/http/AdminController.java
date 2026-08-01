package dio.budgeting.infrastructure.http;

import dio.budgeting.domain.UserRepository;
import dio.budgeting.infrastructure.http.response.UserSummaryResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSummaryResponse> listUsers() {
        return userRepository.findAll().stream().map(UserSummaryResponse::from).toList();
    }
}
