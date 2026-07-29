package dio.budgeting.application;

import dio.budgeting.application.output.TransactionOutput;
import dio.budgeting.domain.Category;
import dio.budgeting.domain.Transaction;
import dio.budgeting.domain.TransactionRepository;
import dio.budgeting.infrastructure.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

class ListTransactionsByCategoryUseCaseTest {

    private TransactionRepository transactionRepository;
    private CurrentUserService currentUserService;
    private ListTransactionsByCategoryUseCase useCase;

    @BeforeEach
    void setUp() {
        transactionRepository = Mockito.mock(TransactionRepository.class);
        currentUserService = Mockito.mock(CurrentUserService.class);
        when(currentUserService.getCurrentUserId()).thenReturn("user-teste-id");
        useCase = new ListTransactionsByCategoryUseCase(transactionRepository, currentUserService);
    }

    @Test
    void shouldListTransactionsOnlyForCurrentUser() {
        Transaction transaction = new Transaction("Mercado", 5000L, Category.GROCERIES, "BRL", "user-teste-id");
        when(transactionRepository.findAllByCategoryAndUserId(Category.GROCERIES, "user-teste-id"))
                .thenReturn(List.of(transaction));

        List<TransactionOutput> outputs = useCase.execute(Category.GROCERIES);

        assertEquals(1, outputs.size());
        assertEquals("Mercado", outputs.get(0).description());
    }

    @Test
    void shouldReturnEmptyListWhenNoTransactionsInCategory() {
        when(transactionRepository.findAllByCategoryAndUserId(Category.HEALTH, "user-teste-id"))
                .thenReturn(List.of());

        List<TransactionOutput> outputs = useCase.apply(new ListTransactionsByCategoryUseCase.Input(Category.HEALTH));

        assertTrue(outputs.isEmpty());
    }
}
