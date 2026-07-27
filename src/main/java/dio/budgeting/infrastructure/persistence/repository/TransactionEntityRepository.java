package dio.budgeting.infrastructure.persistence.repository;

import dio.budgeting.domain.Category;
import dio.budgeting.infrastructure.persistence.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TransactionEntityRepository extends JpaRepository<TransactionEntity, UUID> {

    List<TransactionEntity> findAllByCategoryAndUserId(Category category, String userId);

    @Query("SELECT SUM(t.amount) FROM TransactionEntity t WHERE t.category = :category AND t.userId = :userId")
    Double sumAmountByCategoryAndUserId(@Param("category") Category category, @Param("userId") String userId);
}