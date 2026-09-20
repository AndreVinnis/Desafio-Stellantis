package com.andre.DesafioStellantis.services;

import com.andre.DesafioStellantis.domain.Dealership;
import com.andre.DesafioStellantis.dto.request.DealershipRequest;
import com.andre.DesafioStellantis.dto.response.DealershipResponse;
import com.andre.DesafioStellantis.exceptions.DealershipNotFoundException;
import com.andre.DesafioStellantis.exceptions.InvalidCepException;
import com.andre.DesafioStellantis.exceptions.InvalidCnpjException;
import com.andre.DesafioStellantis.repository.DealershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class DealershipService {

    @Autowired
    private DealershipRepository dealershipRepository;

    @Transactional
    public DealershipResponse createDealership(DealershipRequest dealershipRequest){
        if(!isValidCnpj(dealershipRequest.cnpj())){
            throw new InvalidCnpjException(dealershipRequest.cnpj());
        }
        if(!isValidCep(dealershipRequest.address().getCep())){
            throw new InvalidCepException(dealershipRequest.address().getCep());
        }
        Dealership dealership = Dealership.builder()
                .name(dealershipRequest.name())
                .cnpj(dealershipRequest.cnpj().replaceAll("\\D", ""))
                .address(dealershipRequest.address())
                .build();

        return toResponse(dealershipRepository.save(dealership));
    }

    @Transactional
    public List<DealershipResponse> findAll(){
        List<DealershipResponse> response = new ArrayList<>();
        List<Dealership> dealerships = dealershipRepository.findAll();
        for(Dealership dealership: dealerships){
            response.add(toResponse(dealership));
        }
        return response;
    }

    @Transactional
    public DealershipResponse findById(Long id){
        Dealership dealership = dealershipRepository.findById(id).orElseThrow(
                () -> new DealershipNotFoundException()
        );
        return toResponse(dealership);
    }

    @Transactional
    public DealershipResponse update(Long id, DealershipRequest dealershipRequest){
        Dealership dealership = dealershipRepository.findById(id).orElseThrow(
                () -> new DealershipNotFoundException()
        );
        dealership.setName(dealershipRequest.name());
        if(!isValidCnpj(dealershipRequest.cnpj())){
            throw new InvalidCnpjException(dealershipRequest.cnpj());
        }
        dealership.setCnpj(dealershipRequest.cnpj().replaceAll("\\D", ""));
        if(!isValidCep(dealershipRequest.address().getCep())){
            throw new InvalidCepException(dealershipRequest.address().getCep());
        }
        dealership.setAddress(dealershipRequest.address());
        return toResponse(dealershipRepository.save(dealership));
    }

    @Transactional
    public void delete(Long id){
        Dealership dealership = dealershipRepository.findById(id).orElseThrow(
                () -> new DealershipNotFoundException()
        );
        dealershipRepository.delete(dealership);
    }

    private DealershipResponse toResponse(Dealership dealership){
        return new DealershipResponse(
                dealership.getId(),
                dealership.getName(),
                dealership.getCnpj(),
                dealership.getAddress(),
                null
        );
    }

    private boolean isValidCep(String cep) {
        if (cep == null) {
            return false;
        }
        return cep.matches("^\\d{5}-\\d{3}$");
    }

    private boolean isValidCnpj(String cnpj) {
        if (cnpj == null) {
            return false;
        }

        cnpj = cnpj.replaceAll("\\D", "");
        if (cnpj.length() != 14 || cnpj.matches("(\\d)\\1{13}")) {
            return false;
        }

        try {
            int soma = 0;
            int peso = 2;
            for (int i = 11; i >= 0; i--) {
                int num = cnpj.charAt(i) - 48;
                soma += num * peso;
                peso = (peso == 9) ? 2 : peso + 1;
            }

            int resto = soma % 11;
            char digito13 = (resto < 2) ? '0' : (char) ((11 - resto) + 48);

            soma = 0;
            peso = 2;
            for (int i = 12; i >= 0; i--) {
                int num = cnpj.charAt(i) - 48;
                soma += num * peso;
                peso = (peso == 9) ? 2 : peso + 1;
            }

            resto = soma % 11;
            char digito14 = (resto < 2) ? '0' : (char) ((11 - resto) + 48);
            return (digito13 == cnpj.charAt(12)) && (digito14 == cnpj.charAt(13));
        } catch (Exception e) {
            return false;
        }
    }
}
