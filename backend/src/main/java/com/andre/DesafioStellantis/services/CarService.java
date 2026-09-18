package com.andre.DesafioStellantis.services;

import com.andre.DesafioStellantis.domain.Car;
import com.andre.DesafioStellantis.domain.Dealership;
import com.andre.DesafioStellantis.dto.request.CarCreateRequest;
import com.andre.DesafioStellantis.dto.request.DealershipRequest;
import com.andre.DesafioStellantis.dto.response.CarResponse;
import com.andre.DesafioStellantis.dto.response.DealershipResponse;
import com.andre.DesafioStellantis.exceptions.*;
import com.andre.DesafioStellantis.repository.CarRepository;
import com.andre.DesafioStellantis.repository.DealershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private DealershipRepository dealershipRepository;


    @Transactional
    public CarResponse createCar(CarCreateRequest carRequest){
        if(carRequest.year() < 1900){
            throw new InvalidYearException(carRequest.year());
        }
        if(carRequest.price().intValue() < 0){
            throw new InvalidPriceException(carRequest.price());
        }
        if(carRequest.fuelsTypes().isEmpty()){
            throw new InvalidFuelTypesException();
        }
        Dealership dealership = dealershipRepository.findById(carRequest.dealershipId()).orElseThrow(
                () -> new DearlershipNotFoundExcepition()
        );

        Car car = Car.builder()
                .mark(carRequest.mark())
                .model(carRequest.model())
                .chassis(carRequest.chassis())
                .year(carRequest.year())
                .price(carRequest.price())
                .fuelsTypes(carRequest.fuelsTypes())
                .color(carRequest.color())
                .externalColor(carRequest.externalColor())
                .dealership(dealership)
                .build();

        return toResponse(carRepository.save(car));
    }

    @Transactional
    public List<CarResponse> findAll(){
        List<CarResponse> response = new ArrayList<>();
        List<Car> cars = carRepository.findAll();
        for(Car car: cars){
            response.add(toResponse(car));
        }
        return response;
    }

    @Transactional
    public CarResponse findById(Long id){
        Car car = carRepository.findById(id).orElseThrow(
                () -> new CarNotFoundException()
        );
        return toResponse(car);
    }

    @Transactional
    public CarResponse update(Long id, CarCreateRequest carRequest){
        Car car = carRepository.findById(id).orElseThrow(
                () -> new CarNotFoundException()
        );
        if(carRequest.year() < 1900){
            throw new InvalidYearException(carRequest.year());
        }
        if(carRequest.price().intValue() < 0){
            throw new InvalidPriceException(carRequest.price());
        }
        if(carRequest.fuelsTypes().isEmpty()){
            throw new InvalidFuelTypesException();
        }
        Dealership dealership = dealershipRepository.findById(carRequest.dealershipId()).orElseThrow(
                () -> new DearlershipNotFoundExcepition()
        );

        car.setMark(carRequest.mark());
        car.setModel(carRequest.model());
        car.setChassis(carRequest.chassis());
        car.setYear(carRequest.year());
        car.setPrice(carRequest.price());
        car.setFuelsTypes(carRequest.fuelsTypes());
        car.setColor(carRequest.color());
        car.setExternalColor(carRequest.externalColor());
        car.setDealership(dealership);
        return toResponse(carRepository.save(car));
    }

    @Transactional
    public void delete(Long id){
        Car car = carRepository.findById(id).orElseThrow(
                () -> new CarNotFoundException()
        );
        carRepository.delete(car);
    }



    private CarResponse toResponse(Car car){
        return new CarResponse(
              car.getMark(),
              car.getModel(),
              car.getYear(),
              car.getPrice(),
              car.getExternalColor()
        );
    }
}
