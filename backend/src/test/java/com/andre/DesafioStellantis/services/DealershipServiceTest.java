package com.andre.DesafioStellantis.services;

import com.andre.DesafioStellantis.domain.Address;
import com.andre.DesafioStellantis.domain.Dealership;
import com.andre.DesafioStellantis.dto.request.DealershipRequest;
import com.andre.DesafioStellantis.dto.response.DealershipResponse;
import com.andre.DesafioStellantis.exceptions.InvalidCepException;
import com.andre.DesafioStellantis.exceptions.InvalidCnpjException;
import com.andre.DesafioStellantis.repository.DealershipRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ActiveProfiles("test")
@ExtendWith(MockitoExtension.class)
class DealershipServiceTest {

    @Mock
    private DealershipRepository dealershipRepository;

    @InjectMocks
    private DealershipService dealershipService;

    @Captor
    private ArgumentCaptor<Dealership> dealershipCaptor;

    private Address validAddress;
    private DealershipRequest validRequest;

    private final String VALID_CNPJ = "00.000.000/0001-91";
    private final String VALID_CEP = "01001-000";

    @BeforeEach
    void setup() {
        validAddress = new Address();
        validAddress.setCep(VALID_CEP);

        validRequest = new DealershipRequest(
                "Concessionária Stellantis",
                VALID_CNPJ,
                validAddress
        );
    }

    @Test
    @DisplayName("Deve criar uma concessionária com sucesso quando os dados forem válidos")
    void createDealership_ShouldCreateDealership_WhenDataIsValid() {
        // Arrange
        Dealership savedDealership = Dealership.builder()
                .name(validRequest.name())
                .cnpj(VALID_CNPJ)
                .address(validAddress)
                .build();

        when(dealershipRepository.save(any(Dealership.class))).thenReturn(savedDealership);

        // Act
        DealershipResponse result = dealershipService.createDealership(validRequest);

        // Assert
        assertNotNull(result);
        verify(dealershipRepository, times(1)).save(dealershipCaptor.capture());
        Dealership capturedDealership = dealershipCaptor.getValue();

        assertEquals(validRequest.name(), capturedDealership.getName());
        assertEquals("00000000000191", capturedDealership.getCnpj());
        assertEquals(validRequest.address(), capturedDealership.getAddress());
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {
            "123",
            "18.665.418/0001-60",
            "ABCDEFGHIJKLMN",
    })
    @DisplayName("Deve lançar exceção quando o CNPJ for inválido")
    void createDealership_ShouldThrowInvalidCnpjException_WhenCnpjIsInvalid(String invalidCnpj) {
        // Arrange
        DealershipRequest requestWithInvalidCnpj = new DealershipRequest(
                "Concessionária Falha",
                invalidCnpj,
                validAddress
        );

        // Act
        InvalidCnpjException exception = assertThrows(
                InvalidCnpjException.class,
                () -> dealershipService.createDealership(requestWithInvalidCnpj)
        );

        // Assert
        assertNotNull(exception);
        verify(dealershipRepository, never()).save(any(Dealership.class));
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {
            "01001000",
            "0100-1000",
            "01001-00",
    })
    @DisplayName("Deve lançar exceção quando o CEP for inválido")
    void createDealership_ShouldThrowInvalidCepException_WhenCepIsInvalid(String invalidCep) {
        // Arrange
        Address invalidAddress = new Address();
        invalidAddress.setCep(invalidCep);

        DealershipRequest requestWithInvalidCep = new DealershipRequest(
                "Concessionária Falha",
                VALID_CNPJ,
                invalidAddress
        );

        // Act
        InvalidCepException exception = assertThrows(
                InvalidCepException.class,
                () -> dealershipService.createDealership(requestWithInvalidCep)
        );

        // Assert
        assertNotNull(exception);
        verify(dealershipRepository, never()).save(any(Dealership.class));
    }
}