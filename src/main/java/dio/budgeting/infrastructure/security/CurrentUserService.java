package dio.budgeting.infrastructure.security;

import dio.budgeting.domain.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    public User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public String getCurrentUserId() {
        return getCurrentUser().getId();
    }
}