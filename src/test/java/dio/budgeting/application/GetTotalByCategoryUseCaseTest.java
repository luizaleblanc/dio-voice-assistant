package dio.budgeting.application;

import dio.budgeting.application.input.GetTotalByCategoryInput;
import dio.budgeting.application.output.GetTotalByCategoryOutput;
import dio.budgeting.domain.Category;
import dio.budgeting.domain.TransactionRepository;
import dio.budgeting.infrastructure.security.CurrentUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class GetTotalByCategoryUseCaseTest {

    private TransactionRepository transactionRepository;
    private CurrentUserService currentUserService;
    private GetTotalByCategoryUseCase useCase;

    @BeforeEach
    void setUp() {
        transactionRepository = Mockito.mock(TransactionRepository.class);
        currentUserService = Mockito.mock(CurrentUserService.class);
        when(currentUserService.getCurrentUserId()).thenReturn("user-teste-id");
        useCase = new GetTotalByCategoryUseCase(transactionRepository, currentUserService);
    }

    @Test
    void shouldReturnTotalForCurrentUserAndCategory() {
        when(transactionRepository.sumAmountByCategoryAndUserId(Category.GROCERIES, "user-teste-id")).thenReturn(150.0);

        GetTotalByCategoryOutput output = useCase.apply(new GetTotalByCategoryInput(Category.GROCERIES));

        assertEquals(150.0, output.total());
    }

    @Test
    void shouldReturnZeroWhenNoTransactionsExist() {
        when(transactionRepository.sumAmountByCategoryAndUserId(Category.LEISURE, "user-teste-id")).thenReturn(0.0);

        double total = useCase.execute(Category.LEISURE);

        assertEquals(0.0, total);
    }
}
