package com.skywings.airline.dto.request;

import jakarta.validation.constraints.NotNull;

public class PaymentRequest {

    private Long bookingId;
    private String pnrNumber;

    @NotNull(message = "Payment method is required")
    private String paymentMethod = "CARD"; // CARD, UPI, NET_BANKING

    @NotNull(message = "Payment amount is required")
    private Double amount;

    private String cardLastFour = "4242";

    public PaymentRequest() {
    }

    public PaymentRequest(Long bookingId, String pnrNumber, String paymentMethod, Double amount, String cardLastFour) {
        this.bookingId = bookingId;
        this.pnrNumber = pnrNumber;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.cardLastFour = cardLastFour;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getPnrNumber() {
        return pnrNumber;
    }

    public void setPnrNumber(String pnrNumber) {
        this.pnrNumber = pnrNumber;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCardLastFour() {
        return cardLastFour;
    }

    public void setCardLastFour(String cardLastFour) {
        this.cardLastFour = cardLastFour;
    }
}
