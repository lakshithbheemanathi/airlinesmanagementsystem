package com.skywings.airline.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Payment entity recording simulated transaction records for bookings.
 */
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "transaction_id", nullable = false, unique = true, length = 60)
    private String transactionId;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod; // CARD, UPI, NET_BANKING

    @Column(nullable = false)
    private Double amount;

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus = "SUCCESS"; // SUCCESS, REFUNDED, FAILED

    @Column(name = "paid_at", nullable = false)
    private LocalDateTime paidAt;

    @Column(name = "card_last_four", length = 10)
    private String cardLastFour = "4242";

    @Column(name = "gateway_response", length = 100)
    private String gatewayResponse = "SIMULATED_PAYMENT_SUCCESS";

    public Payment() {
    }

    public Payment(Booking booking, String transactionId, String paymentMethod, Double amount, String paymentStatus, LocalDateTime paidAt) {
        this.booking = booking;
        this.transactionId = transactionId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.paidAt = paidAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.paidAt == null) {
            this.paidAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
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

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public String getCardLastFour() {
        return cardLastFour;
    }

    public void setCardLastFour(String cardLastFour) {
        this.cardLastFour = cardLastFour;
    }

    public String getGatewayResponse() {
        return gatewayResponse;
    }

    public void setGatewayResponse(String gatewayResponse) {
        this.gatewayResponse = gatewayResponse;
    }
}
