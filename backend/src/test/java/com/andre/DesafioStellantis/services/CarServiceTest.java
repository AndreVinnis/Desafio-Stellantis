package com.andre.DesafioStellantis.services;

import com.andre.DesafioStellantis.domain.Car;
import com.andre.DesafioStellantis.domain.Dealership;
import com.andre.DesafioStellantis.dto.request.CarCreateRequest;
import com.andre.DesafioStellantis.dto.response.CarResponse;
import com.andre.DesafioStellantis.enums.FuelType;
import com.andre.DesafioStellantis.exceptions.*;
import com.andre.DesafioStellantis.repository.CarRepository;
import com.andre.DesafioStellantis.repository.DealershipRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ActiveProfiles("test")
@ExtendWith(MockitoExtension.class)
class CarServiceTest {

    @Mock
    private CarRepository carRepository;

    @Mock
    private DealershipRepository dealershipRepository;

    @InjectMocks
    private CarService carService;

    @Captor
    private ArgumentCaptor<Car> carCaptor;

    private Dealership validDealership;
    private CarCreateRequest validRequest;
    private Car validCar;

    private final Long VALID_CAR_ID = 1L;
    private final Long VALID_DEALERSHIP_ID = 1L;

    @BeforeEach
    void setup() {
        validDealership = Dealership.builder()
                .id(VALID_DEALERSHIP_ID)
                .name("Concessionária Stellantis")
                .cnpj("00000000000191")
                .build();

        validRequest = new CarCreateRequest(
                "Fiat",
                "Toro",
                "9BD123456789",
                2024,
                BigDecimal.valueOf(150000.00),
                List.of(FuelType.GASOLINE, FuelType.ETHANOL),
                "Preto",
                "Branco Metálico",
                VALID_DEALERSHIP_ID
        );

        validCar = Car.builder()
                .id(VALID_CAR_ID)
                .mark("Fiat")
                .model("Toro")
                .chassis("9BD123456789")
                .year(2024)
                .price(BigDecimal.valueOf(150000.00))
                .fuelsTypes(List.of(FuelType.GASOLINE, FuelType.ETHANOL))
                .color("Preto")
                .externalColor("Branco Metálico")
                .dealership(validDealership)
                .build();
    }

    @Test
    @DisplayName("Deve criar um carro com sucesso quando os dados forem válidos")
    void createCar_ShouldCreateCar_WhenDataIsValid() {
        // Arrange
        when(dealershipRepository.findById(VALID_DEALERSHIP_ID)).thenReturn(Optional.of(validDealership));
        when(carRepository.save(any(Car.class))).thenReturn(validCar);

        // Act
        CarResponse result = carService.createCar(validRequest);

        // Assert
        assertNotNull(result);
        verify(dealershipRepository, times(1)).findById(VALID_DEALERSHIP_ID);
        verify(carRepository, times(1)).save(carCaptor.capture());

        Car capturedCar = carCaptor.getValue();
        assertEquals(validRequest.mark(), capturedCar.getMark());
        assertEquals(validRequest.model(), capturedCar.getModel());
        assertEquals(validRequest.year(), capturedCar.getYear());
        assertEquals(validDealership, capturedCar.getDealership());
    }

    @ParameterizedTest
    @ValueSource(ints = {1899, 1500, 0, -1})
    @DisplayName("Deve lançar exceção ao criar quando o ano for menor que 1900")
    void createCar_ShouldThrowInvalidYearException_WhenYearIsInvalid(int invalidYear) {
        // Arrange
        CarCreateRequest requestWithInvalidYear = new CarCreateRequest(
                validRequest.mark(), validRequest.model(), validRequest.chassis(),
                invalidYear, validRequest.price(), validRequest.fuelsTypes(),
                validRequest.color(), validRequest.externalColor(), validRequest.dealershipId()
        );

        // Act & Assert
        assertThrows(
                InvalidYearException.class,
                () -> carService.createCar(requestWithInvalidYear)
        );
        verify(dealershipRepository, never()).findById(anyLong());
        verify(carRepository, never()).save(any(Car.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao criar quando o preço for negativo")
    void createCar_ShouldThrowInvalidPriceException_WhenPriceIsInvalid() {
        // Arrange
        CarCreateRequest requestWithInvalidPrice = new CarCreateRequest(
                validRequest.mark(), validRequest.model(), validRequest.chassis(),
                validRequest.year(), BigDecimal.valueOf(-1.0), validRequest.fuelsTypes(),
                validRequest.color(), validRequest.externalColor(), validRequest.dealershipId()
        );

        // Act & Assert
        assertThrows(
                InvalidPriceException.class,
                () -> carService.createCar(requestWithInvalidPrice)
        );
        verify(carRepository, never()).save(any(Car.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao criar quando a lista de combustíveis estiver vazia")
    void createCar_ShouldThrowInvalidFuelTypesException_WhenFuelTypesIsEmpty() {
        // Arrange
        CarCreateRequest requestWithEmptyFuelTypes = new CarCreateRequest(
                validRequest.mark(), validRequest.model(), validRequest.chassis(),
                validRequest.year(), validRequest.price(), Collections.emptyList(),
                validRequest.color(), validRequest.externalColor(), validRequest.dealershipId()
        );

        // Act & Assert
        assertThrows(
                InvalidFuelTypesException.class,
                () -> carService.createCar(requestWithEmptyFuelTypes)
        );
        verify(carRepository, never()).save(any(Car.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao criar quando a concessionária não for encontrada")
    void createCar_ShouldThrowDearlershipNotFoundExcepition_WhenDealershipDoesNotExist() {
        // Arrange
        when(dealershipRepository.findById(VALID_DEALERSHIP_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                DearlershipNotFoundExcepition.class,
                () -> carService.createCar(validRequest)
        );
        verify(dealershipRepository, times(1)).findById(VALID_DEALERSHIP_ID);
        verify(carRepository, never()).save(any(Car.class));
    }

    @Test
    @DisplayName("Deve retornar uma lista de carros com sucesso")
    void findAll_ShouldReturnListOfCars_WhenSuccessful() {
        // Arrange
        when(carRepository.findAll()).thenReturn(List.of(validCar));

        // Act
        List<CarResponse> result = carService.findAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(validCar.getMark(), result.getFirst().mark());
        verify(carRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve retornar uma lista vazia quando não houver carros")
    void findAll_ShouldReturnEmptyList_WhenNoCarsExist() {
        // Arrange
        when(carRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<CarResponse> result = carService.findAll();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(carRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Deve retornar um carro com sucesso ao buscar por ID")
    void findById_ShouldReturnCar_WhenIdExists() {
        // Arrange
        when(carRepository.findById(VALID_CAR_ID)).thenReturn(Optional.of(validCar));

        // Act
        CarResponse result = carService.findById(VALID_CAR_ID);

        // Assert
        assertNotNull(result);
        assertEquals(validCar.getMark(), result.mark());
        verify(carRepository, times(1)).findById(VALID_CAR_ID);
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar por ID que não existe")
    void findById_ShouldThrowCarNotFoundException_WhenIdDoesNotExist() {
        // Arrange
        when(carRepository.findById(VALID_CAR_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                CarNotFoundException.class,
                () -> carService.findById(VALID_CAR_ID)
        );
        verify(carRepository, times(1)).findById(VALID_CAR_ID);
    }

    @Test
    @DisplayName("Deve atualizar um carro com sucesso quando os dados forem válidos")
    void update_ShouldUpdateCar_WhenDataIsValid() {
        // Arrange
        when(carRepository.findById(VALID_CAR_ID)).thenReturn(Optional.of(validCar));
        when(dealershipRepository.findById(VALID_DEALERSHIP_ID)).thenReturn(Optional.of(validDealership));
        when(carRepository.save(any(Car.class))).thenReturn(validCar);

        // Act
        CarResponse result = carService.update(VALID_CAR_ID, validRequest);

        // Assert
        assertNotNull(result);
        verify(carRepository, times(1)).findById(VALID_CAR_ID);
        verify(dealershipRepository, times(1)).findById(VALID_DEALERSHIP_ID);
        verify(carRepository, times(1)).save(carCaptor.capture());

        Car capturedCar = carCaptor.getValue();
        assertEquals(validRequest.mark(), capturedCar.getMark());
        assertEquals(validRequest.year(), capturedCar.getYear());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar atualizar carro que não existe")
    void update_ShouldThrowCarNotFoundException_WhenIdDoesNotExist() {
        // Arrange
        when(carRepository.findById(VALID_CAR_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                CarNotFoundException.class,
                () -> carService.update(VALID_CAR_ID, validRequest)
        );
        verify(carRepository, never()).save(any(Car.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao atualizar quando o ano for menor que 1900")
    void update_ShouldThrowInvalidYearException_WhenYearIsInvalid() {
        // Arrange
        CarCreateRequest requestWithInvalidYear = new CarCreateRequest(
                validRequest.mark(), validRequest.model(), validRequest.chassis(),
                1850, validRequest.price(), validRequest.fuelsTypes(),
                validRequest.color(), validRequest.externalColor(), validRequest.dealershipId()
        );
        when(carRepository.findById(VALID_CAR_ID)).thenReturn(Optional.of(validCar));

        // Act & Assert
        assertThrows(
                InvalidYearException.class,
                () -> carService.update(VALID_CAR_ID, requestWithInvalidYear)
        );
        verify(carRepository, never()).save(any(Car.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao atualizar quando a concessionária não for encontrada")
    void update_ShouldThrowDearlershipNotFoundExcepition_WhenDealershipDoesNotExist() {
        // Arrange
        when(carRepository.findById(VALID_CAR_ID)).thenReturn(Optional.of(validCar));
        when(dealershipRepository.findById(VALID_DEALERSHIP_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                DearlershipNotFoundExcepition.class,
                () -> carService.update(VALID_CAR_ID, validRequest)
        );
        verify(carRepository, never()).save(any(Car.class));
    }

    @Test
    @DisplayName("Deve deletar um carro com sucesso")
    void delete_ShouldDeleteCar_WhenSuccessful() {
        // Arrange
        when(carRepository.findById(VALID_CAR_ID)).thenReturn(Optional.of(validCar));
        doNothing().when(carRepository).delete(validCar);

        // Act
        carService.delete(VALID_CAR_ID);

        // Assert
        verify(carRepository, times(1)).findById(VALID_CAR_ID);
        verify(carRepository, times(1)).delete(validCar);
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar deletar um carro que não existe")
    void delete_ShouldThrowCarNotFoundException_WhenIdDoesNotExist() {
        // Arrange
        when(carRepository.findById(VALID_CAR_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                CarNotFoundException.class,
                () -> carService.delete(VALID_CAR_ID)
        );
        verify(carRepository, never()).delete(any(Car.class));
    }
}