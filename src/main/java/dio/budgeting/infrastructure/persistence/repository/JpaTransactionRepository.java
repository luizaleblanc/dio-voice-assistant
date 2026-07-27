package dio.budgeting.infrastructure.persistence.repository;

import dio.budgeting.domain.Category;
import dio.budgeting.domain.Transaction;
import dio.budgeting.domain.TransactionRepository;
import dio.budgeting.infrastructure.persistence.entity.TransactionEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JpaTransactionRepository implements TransactionRepository {

    private final TransactionEntityRepository entityRepository;

    public JpaTransactionRepository(TransactionEntityRepository entityRepository) {
        this.entityRepository = entityRepository;
    }

    @Override
    public Transaction save(Transaction transaction) {
        TransactionEntity entity = TransactionEntity.from(transaction);
        entityRepository.save(entity);
        return transaction;
    }

    @Override
    public List<Transaction> findAllByCategoryAndUserId(Category category, String userId) {
        return entityRepository.findAllByCategoryAndUserId(category, userId)
                .stream()
                .map(TransactionEntity::toDomain)
                .toList();
    }

    @Override
    public Double sumAmountByCategoryAndUserId(Category category, String userId) {
        Double total = entityRepository.sumAmountByCategoryAndUserId(category, userId);
        return total != null ? total : 0.0;
    }

    @Override
    public void deleteAllByUserId(String userId) {
        entityRepository.deleteByUserId(userId);
    }
}