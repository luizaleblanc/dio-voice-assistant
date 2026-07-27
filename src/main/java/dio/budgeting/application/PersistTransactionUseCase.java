package dio.budgeting.application;

import dio.budgeting.application.input.PersistTransactionInput;
import dio.budgeting.application.output.TransactionOutput;
import dio.budgeting.domain.Transaction;
import dio.budgeting.domain.TransactionRepository;
import dio.budgeting.infrastructure.security.CurrentUserService;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
@Description("Cria e salva uma nova transação financeira no banco de dados")
public class PersistTransactionUseCase implements Function<PersistTransactionInput, TransactionOutput> {

    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    public PersistTransactionUseCase(TransactionRepository transactionRepository, CurrentUserService currentUserService) {
        this.transactionRepository = transactionRepository;
        this.currentUserService = currentUserService;
    }

    public TransactionOutput execute(PersistTransactionInput input) {
        if (input.amount() <= 0) {
            throw new IllegalArgumentException("Operação negada: O valor da transação deve ser maior que zero.");
        }

        Transaction transaction = new Transaction(
                input.description(),
                input.amount(),
                input.category(),
                input.currency(),
                currentUserService.getCurrentUserId()
        );

        transactionRepository.save(transaction);

        return TransactionOutput.from(transaction);
    }

    @Override
    public TransactionOutput apply(PersistTransactionInput input) {
        return execute(input);
    }
}