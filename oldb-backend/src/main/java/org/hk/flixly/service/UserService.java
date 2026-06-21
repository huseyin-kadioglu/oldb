package org.hk.flixly.service;

import org.hk.flixly.model.UserEntity;
import org.hk.flixly.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserEntity save(UserEntity user) {

        UserEntity entity = new UserEntity();
        entity.setUsername(user.getUsername());
        entity.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
        entity.setRole("DEFAULT");
        return userRepository.save(entity);
    }

    @Override
    public UserEntity loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity findUser = userRepository.findByUsername(username).orElseThrow();

        if (findUser == null) {
            throw new UsernameNotFoundException("There is no user with this username");
        }

        return findUser;
    }
}
