package com.andre.DesafioStellantis.services;

import com.andre.DesafioStellantis.domain.Address;
import com.andre.DesafioStellantis.domain.Dealership;
import com.andre.DesafioStellantis.dto.request.DealershipRequest;
import com.andre.DesafioStellantis.dto.response.DealershipResponse;
import com.andre.DesafioStellantis.exceptions.DealershipNotFoundException;
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

import java.util.Collections;
import java.util.List;
import java.util.Optional;

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
    private Dealership validDealership;

    private final String VALID_CNPJ = "00.000.000/0001-91";
    private final String VALID_CEP = "01001-000";
    private final Long VALID_ID = 1L;

    @BeforeEach
    void setup() {
        validAddress = new Address();
        validAddress.setCep(VALID_CEP);

        validRequest = new DealershipRequest(
                "Concessionária Stellantis",
                VALID_CNPJ,
                validAddress
        );

        validDealership = Dealership.builder()
                .id(VALID_ID)
                .name("Concessionária Stellantis")
                .cnpj("00000000000191")
                .address(validAddress)
                .build();
    }

    @Test
    @DisplayName("Deve criar uma concessionária com sucesso quando os dados forem válidos")
    void createDealership_ShouldCreateDealership_WhenDataIsValid() {
        // Arrange
        when(dealershipRepository.save(any(Dealership.class))).thenReturn(validDealership);

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
    @DisplayName("Deve lançar exceção ao criar quando o CNPJ for inválido")
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
    @DisplayName("Deve lançar exceção ao criar quando o CEP for inválido")
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

    @Test
    @DisplayName("Deve retornar uma lista de concessionárias com sucesso")
    void findAll_ShouldReturnListOfDealerships_WhenSuccessful() {
        // Arrange
        when(dealershipRepository.findAll()).thenReturn(List.of(validDealership));

        // Act
        List<DealershipResponse> result = dealershipService.findAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(validDealership.getName(), result.get(0).name());
        verify(dealershipRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve retornar uma lista vazia quando não houver concessionárias")
    void findAll_ShouldReturnEmptyList_WhenNoDealershipsExist() {
        // Arrange
        when(dealershipRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<DealershipResponse> result = dealershipService.findAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(dealershipRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve retornar uma concessionária com sucesso ao buscar por ID")
    void findById_ShouldReturnDealership_WhenIdExists() {
        // Arrange
        when(dealershipRepository.findById(VALID_ID)).thenReturn(Optional.of(validDealership));

        // Act
        DealershipResponse result = dealershipService.findById(VALID_ID);

        // Assert
        assertNotNull(result);
        assertEquals(validDealership.getName(), result.name());
        verify(dealershipRepository, times(1)).findById(VALID_ID);
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar por ID que não existe")
    void findById_ShouldThrowDearlershipNotFoundExcepition_WhenIdDoesNotExist() {
        // Arrange
        when(dealershipRepository.findById(VALID_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                DealershipNotFoundException.class,
                () -> dealershipService.findById(VALID_ID)
        );
        verify(dealershipRepository, times(1)).findById(VALID_ID);
    }

    @Test
    @DisplayName("Deve atualizar uma concessionária com sucesso quando os dados forem válidos")
    void update_ShouldUpdateDealership_WhenDataIsValid() {
        // Arrange
        when(dealershipRepository.findById(VALID_ID)).thenReturn(Optional.of(validDealership));
        when(dealershipRepository.save(any(Dealership.class))).thenReturn(validDealership);

        // Act
        DealershipResponse result = dealershipService.update(VALID_ID, validRequest);

        // Assert
        assertNotNull(result);
        verify(dealershipRepository, times(1)).findById(VALID_ID);
        verify(dealershipRepository, times(1)).save(dealershipCaptor.capture());

        Dealership capturedDealership = dealershipCaptor.getValue();
        assertEquals(validRequest.name(), capturedDealership.getName());
        assertEquals("00000000000191", capturedDealership.getCnpj());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar atualizar concessionária que não existe")
    void update_ShouldThrowDearlershipNotFoundExcepition_WhenIdDoesNotExist() {
        // Arrange
        when(dealershipRepository.findById(VALID_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                DealershipNotFoundException.class,
                () -> dealershipService.update(VALID_ID, validRequest)
        );
        verify(dealershipRepository, never()).save(any(Dealership.class));
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {
            "123",
            "18.665.418/0001-60",
            "ABCDEFGHIJKLMN",
    })
    @DisplayName("Deve lançar exceção ao atualizar quando o CNPJ for inválido")
    void update_ShouldThrowInvalidCnpjException_WhenCnpjIsInvalid(String invalidCnpj) {
        // Arrange
        DealershipRequest requestWithInvalidCnpj = new DealershipRequest(
                "Concessionária Falha",
                invalidCnpj,
                validAddress
        );
        when(dealershipRepository.findById(VALID_ID)).thenReturn(Optional.of(validDealership));

        // Act & Assert
        assertThrows(
                InvalidCnpjException.class,
                () -> dealershipService.update(VALID_ID, requestWithInvalidCnpj)
        );
        verify(dealershipRepository, never()).save(any(Dealership.class));
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {
            "01001000",
            "0100-1000",
            "01001-00",
    })
    @DisplayName("Deve lançar exceção ao atualizar quando o CEP for inválido")
    void update_ShouldThrowInvalidCepException_WhenCepIsInvalid(String invalidCep) {
        // Arrange
        Address invalidAddress = new Address();
        invalidAddress.setCep(invalidCep);

        DealershipRequest requestWithInvalidCep = new DealershipRequest(
                "Concessionária Falha",
                VALID_CNPJ,
                invalidAddress
        );
        when(dealershipRepository.findById(VALID_ID)).thenReturn(Optional.of(validDealership));

        // Act & Assert
        assertThrows(
                InvalidCepException.class,
                () -> dealershipService.update(VALID_ID, requestWithInvalidCep)
        );
        verify(dealershipRepository, never()).save(any(Dealership.class));
    }

    @Test
    @DisplayName("Deve deletar uma concessionária com sucesso")
    void delete_ShouldDeleteDealership_WhenSuccessful() {
        // Arrange
        when(dealershipRepository.findById(VALID_ID)).thenReturn(Optional.of(validDealership));
        doNothing().when(dealershipRepository).delete(validDealership);

        // Act
        dealershipService.delete(VALID_ID);

        // Assert
        verify(dealershipRepository, times(1)).findById(VALID_ID);
        verify(dealershipRepository, times(1)).delete(validDealership);
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar deletar uma concessionária que não existe")
    void delete_ShouldThrowDearlershipNotFoundExcepition_WhenIdDoesNotExist() {
        // Arrange
        when(dealershipRepository.findById(VALID_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                DealershipNotFoundException.class,
                () -> dealershipService.delete(VALID_ID)
        );
        verify(dealershipRepository, never()).delete(any(Dealership.class));
    }
}