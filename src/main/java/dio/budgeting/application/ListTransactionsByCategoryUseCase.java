package dio.budgeting.application;

import dio.budgeting.application.output.TransactionOutput;
import dio.budgeting.domain.Category;
import dio.budgeting.domain.TransactionRepository;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;

@Service
@Description("Busca e lista todas as transações financeiras filtradas por uma categoria específica")
public class ListTransactionsByCategoryUseCase implements Function<ListTransactionsByCategoryUseCase.Input, List<TransactionOutput>> {
    
    private final TransactionRepository transactionRepository;

    public ListTransactionsByCategoryUseCase(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public record Input(Category category) {}

    public List<TransactionOutput> execute(Category category) {
        return transactionRepository.findAllByCategory(category).stream().map(TransactionOutput::from).toList();
    }

    @Override
    public List<TransactionOutput> apply(Input input) {
        return execute(input.category());
    }
}