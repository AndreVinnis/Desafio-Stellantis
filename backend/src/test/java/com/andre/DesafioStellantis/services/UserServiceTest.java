package com.andre.DesafioStellantis.services;

import com.andre.DesafioStellantis.domain.User;
import com.andre.DesafioStellantis.dto.request.UserCreateRequest;
import com.andre.DesafioStellantis.enums.UserRole;
import com.andre.DesafioStellantis.exceptions.InvalidEmailException;
import com.andre.DesafioStellantis.dto.response.UserResponse;
import com.andre.DesafioStellantis.exceptions.UserAlreadyExistException;
import com.andre.DesafioStellantis.exceptions.UserNotFoundException;
import com.andre.DesafioStellantis.repository.UserRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ActiveProfiles("test")
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder encoder;

    @InjectMocks
    private UserService userService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private UserCreateRequest userCreateRequest;

    @BeforeEach
    void setup(){
        userCreateRequest = new UserCreateRequest(
            "Vinicius", "viniandre@gmail.com", "12345678", "Developer"
        );
    }

    @Test
    @DisplayName("Deve criar uma usuário com sucesso quando os dados forem válidos")
    void createUser_ShouldCreateUser_WhenDatasIsValid(){
        //Arrange
        when(userRepository.findByEmail(userCreateRequest.email())).thenReturn(null);
        when(encoder.encode(userCreateRequest.password())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(new User());

        //Act
        User result = userService.createUser(userCreateRequest);

        // Assert
        assertNotNull(result);

        verify(userRepository, times(1)).findByEmail(userCreateRequest.email());
        verify(encoder, times(1)).encode(userCreateRequest.password());

        verify(userRepository, times(1)).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();

        assertEquals(userCreateRequest.name(), capturedUser.getName());
        assertEquals(userCreateRequest.email(), capturedUser.getEmail());
        assertEquals(userCreateRequest.position(), capturedUser.getPosition());
        assertEquals(UserRole.USER, capturedUser.getRole());
    }

    @Test
    @DisplayName("Deve lançar exceção quando já existir um usuário com o mesmo email")
    void createUser_ShouldThrowUserAlreadyExistException_WhenEmailAlreadyExists(){
        //Arrange
        when(userRepository.findByEmail(userCreateRequest.email())).thenReturn(new User());

        //Act
        UserAlreadyExistException exception = assertThrows(
                UserAlreadyExistException.class,
                () -> userService.createUser(userCreateRequest)
        );

        // Assert
        assertEquals("Já existe um usuário com esse email: " + userCreateRequest.email(), exception.getMessage());

        verify(userRepository, times(1)).findByEmail(userCreateRequest.email());
        verify(encoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @ParameterizedTest
    @ValueSource(strings = {"viniandre", "viniandre@", "@gmail.com", "viniandre@gmail", "vini andre@gmail.com", "viniandre@@gmail.com", "   "})
    @DisplayName("Deve lançar exceção quando o email estiver em formato inválido")
    void createUser_ShouldThrowInvalidEmailException_WhenEmailIsInvalid(String invalidEmail){
        //Arrange
        UserCreateRequest request = new UserCreateRequest(
                "Vinicius", invalidEmail, "12345678", "Developer"
        );
        when(userRepository.findByEmail(invalidEmail)).thenReturn(null);

        //Act
        InvalidEmailException exception = assertThrows(
                InvalidEmailException.class,
                () -> userService.createUser(request)
        );

        // Assert
        assertEquals("Email inválido: " + invalidEmail, exception.getMessage());

        verify(userRepository, times(1)).findByEmail(invalidEmail);
        verify(encoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Deve verificar se o email já existe antes de validar o formato do email")
    void createUser_ShouldThrowUserAlreadyExistException_WhenEmailExistsEvenIfInvalid(){
        //Arrange
        when(userRepository.findByEmail(userCreateRequest.email())).thenReturn(new User());

        //Act & Assert
        Exception exception = assertThrows(UserAlreadyExistException.class, () -> userService.createUser(userCreateRequest));
        assertEquals("Já existe um usuário com esse email: " + userCreateRequest.email(), exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Deve promover um usuário comum para ADMIN")
    void promoteToAdmin_ShouldSetRoleAdmin_WhenUserExists(){
        User user = User.builder().id(1L).name("Vinicius").email("viniandre@gmail.com")
                .position("Developer").role(UserRole.USER).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        UserResponse response = userService.promoteToAdmin(1L);

        assertEquals(UserRole.ADMIN, response.role());
        assertEquals(UserRole.ADMIN, user.getRole());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Deve lançar exceção ao promover um usuário inexistente")
    void promoteToAdmin_ShouldThrowUserNotFoundException_WhenUserDoesNotExist(){
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.promoteToAdmin(99L));
        verify(userRepository, never()).save(any(User.class));
    }
}
