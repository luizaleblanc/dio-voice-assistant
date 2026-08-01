package dio.budgeting.infrastructure.persistence.entity;

import dio.budgeting.domain.Role;
import dio.budgeting.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity {

    @Id
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public static UserEntity from(User user) {
        return new UserEntity(user.getId(), user.getEmail(), user.getPassword(), user.getRole());
    }

    public User toDomain() {
        return new User(id, email, password, role);
    }
}
