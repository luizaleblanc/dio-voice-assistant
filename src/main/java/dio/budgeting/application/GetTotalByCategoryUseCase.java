package dio.budgeting.application;

import dio.budgeting.application.input.GetTotalByCategoryInput;
import dio.budgeting.application.output.GetTotalByCategoryOutput;
import dio.budgeting.domain.TransactionRepository;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
@Description("Calcula e retorna o valor total gasto em uma categoria especifica")
public class GetTotalByCategoryUseCase implements Function<GetTotalByCategoryInput, GetTotalByCategoryOutput> {

    private final TransactionRepository transactionRepository;

    public GetTotalByCategoryUseCase(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Override
    public GetTotalByCategoryOutput apply(GetTotalByCategoryInput input) {
        Double total = transactionRepository.sumAmountByCategory(input.category());
        return new GetTotalByCategoryOutput(total);
    }
}