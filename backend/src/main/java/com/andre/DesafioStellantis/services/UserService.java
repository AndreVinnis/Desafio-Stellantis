package com.andre.DesafioStellantis.services;

import com.andre.DesafioStellantis.domain.User;
import com.andre.DesafioStellantis.dto.request.UserCreateRequest;
import com.andre.DesafioStellantis.enums.UserRole;
import com.andre.DesafioStellantis.exceptions.InvalidEmailException;
import com.andre.DesafioStellantis.exceptions.UserAlreadyExistException;
import com.andre.DesafioStellantis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
public class UserService {

    private static final String EMAIL_REGEX = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;


    @Transactional
    public User createUser(UserCreateRequest userRequest){
        if(userRepository.findByEmail(userRequest.email()) != null){
            throw new UserAlreadyExistException(userRequest.email());
        }
        if(!isValidEmail(userRequest.email())){
            throw new InvalidEmailException(userRequest.email());
        }

        User user = User.builder()
                .name(userRequest.name())
                .email(userRequest.email())
                .hashPassword(encoder.encode(userRequest.password()))
                .role(UserRole.USER)
                .position(userRequest.position())
                .build();

        return userRepository.save(user);
    }


    private boolean isValidEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }

}
