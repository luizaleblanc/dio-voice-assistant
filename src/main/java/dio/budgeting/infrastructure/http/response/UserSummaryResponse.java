package dio.budgeting.infrastructure.http.response;

import dio.budgeting.domain.Role;
import dio.budgeting.domain.User;

public record UserSummaryResponse(String id, String email, Role role) {
    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(user.getId(), user.getEmail(), user.getRole());
    }
}
