package dio.budgeting.infrastructure.persistence.repository;

import dio.budgeting.domain.User;
import dio.budgeting.domain.UserRepository;
import dio.budgeting.infrastructure.persistence.entity.UserEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class JpaUserRepository implements UserRepository {

    private final UserEntityRepository entityRepository;

    public JpaUserRepository(UserEntityRepository entityRepository) {
        this.entityRepository = entityRepository;
    }

    @Override
    public User save(User user) {
        entityRepository.save(UserEntity.from(user));
        return user;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return entityRepository.findByEmail(email).map(UserEntity::toDomain);
    }

    @Override
    public List<User> findAll() {
        return entityRepository.findAll().stream().map(UserEntity::toDomain).toList();
    }
}
