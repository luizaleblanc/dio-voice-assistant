package dio.budgeting.infrastructure.http.response;

public record CategorySummary(String category, double total, String currency, int count, double percentage) {
}