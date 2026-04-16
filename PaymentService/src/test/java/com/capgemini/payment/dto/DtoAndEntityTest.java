package com.capgemini.payment.dto;

import com.capgemini.payment.saga.PaymentSaga;
import com.capgemini.payment.saga.SagaStatus;
import com.capgemini.payment.saga.SagaStep;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class DtoAndEntityTest {

    // ── CreateOrderRequest ────────────────────────────────────────────────────

    @Test
    void createOrderRequest_settersAndGetters_shouldWork() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setInvestorId(1L);
        req.setFounderId(2L);
        req.setStartupId(3L);
        req.setStartupName("TechCorp");
        req.setInvestorName("InvestorX");
        req.setInvestorEmail("investor@example.com");
        req.setFounderEmail("founder@example.com");
        req.setAmount(10000.0);

        assertThat(req.getInvestorId()).isEqualTo(1L);
        assertThat(req.getFounderId()).isEqualTo(2L);
        assertThat(req.getStartupId()).isEqualTo(3L);
        assertThat(req.getStartupName()).isEqualTo("TechCorp");
        assertThat(req.getInvestorName()).isEqualTo("InvestorX");
        assertThat(req.getInvestorEmail()).isEqualTo("investor@example.com");
        assertThat(req.getFounderEmail()).isEqualTo("founder@example.com");
        assertThat(req.getAmount()).isEqualTo(10000.0);
    }

    // ── VerifyPaymentRequest ──────────────────────────────────────────────────

    @Test
    void verifyPaymentRequest_settersAndGetters_shouldWork() {
        VerifyPaymentRequest req = new VerifyPaymentRequest();
        req.setRazorpayOrderId("order_123");
        req.setRazorpayPaymentId("pay_456");
        req.setRazorpaySignature("sig_789");

        assertThat(req.getRazorpayOrderId()).isEqualTo("order_123");
        assertThat(req.getRazorpayPaymentId()).isEqualTo("pay_456");
        assertThat(req.getRazorpaySignature()).isEqualTo("sig_789");
    }

    // ── PaymentEventDTO ───────────────────────────────────────────────────────

    @Test
    void paymentEventDTO_allArgsConstructor_shouldSetAllFields() {
        PaymentEventDTO dto = new PaymentEventDTO(
                1L, 2L, 3L, 4L, "StartupX", "InvestorY", 5000.0, "pay_abc", "SUCCESS"
        );

        assertThat(dto.getPaymentId()).isEqualTo(1L);
        assertThat(dto.getInvestorId()).isEqualTo(2L);
        assertThat(dto.getFounderId()).isEqualTo(3L);
        assertThat(dto.getStartupId()).isEqualTo(4L);
        assertThat(dto.getStartupName()).isEqualTo("StartupX");
        assertThat(dto.getInvestorName()).isEqualTo("InvestorY");
        assertThat(dto.getAmount()).isEqualTo(5000.0);
        assertThat(dto.getRazorpayPaymentId()).isEqualTo("pay_abc");
        assertThat(dto.getStatus()).isEqualTo("SUCCESS");
    }

    @Test
    void paymentEventDTO_noArgsConstructor_shouldWork() {
        PaymentEventDTO dto = new PaymentEventDTO();
        dto.setStatus("FAILED");
        assertThat(dto.getStatus()).isEqualTo("FAILED");
    }

    // ── PaymentSaga @PrePersist / @PreUpdate ──────────────────────────────────

    @Test
    void paymentSaga_prePersist_shouldSetTimestamps() throws Exception {
        PaymentSaga saga = new PaymentSaga();
        Method onCreate = PaymentSaga.class.getDeclaredMethod("onCreate");
        onCreate.setAccessible(true);
        onCreate.invoke(saga);

        assertThat(saga.getCreatedAt()).isNotNull();
        assertThat(saga.getUpdatedAt()).isNotNull();
    }

    @Test
    void paymentSaga_preUpdate_shouldSetUpdatedAt() throws Exception {
        PaymentSaga saga = new PaymentSaga();
        Method onUpdate = PaymentSaga.class.getDeclaredMethod("onUpdate");
        onUpdate.setAccessible(true);
        onUpdate.invoke(saga);

        assertThat(saga.getUpdatedAt()).isNotNull();
    }

    @Test
    void paymentSaga_builder_shouldSetAllFields() {
        PaymentSaga saga = PaymentSaga.builder()
                .id(1L)
                .paymentId(10L)
                .razorpayOrderId("order_abc")
                .razorpayPaymentId("pay_xyz")
                .currentStep(SagaStep.ORDER_CREATED)
                .status(SagaStatus.IN_PROGRESS)
                .build();

        assertThat(saga.getId()).isEqualTo(1L);
        assertThat(saga.getPaymentId()).isEqualTo(10L);
        assertThat(saga.getRazorpayOrderId()).isEqualTo("order_abc");
        assertThat(saga.getCurrentStep()).isEqualTo(SagaStep.ORDER_CREATED);
        assertThat(saga.getStatus()).isEqualTo(SagaStatus.IN_PROGRESS);
    }
}