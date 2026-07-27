package dio.budgeting.infrastructure.http.response;

import dio.budgeting.application.output.TransactionOutput;

import java.util.List;

public record DashboardSummaryResponse(
        double totalSpent,
        String currency,
        List<CategorySummary> categories,
        List<TransactionOutput> transactions
) {
}