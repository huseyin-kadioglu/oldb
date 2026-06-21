package org.hk.flixly.service;

import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.repository.UserBookMapRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserBookMapService {

    private final UserBookMapRepository userBookMapRepository;

    public UserBookMapService(UserBookMapRepository userBookMapRepository) {
        this.userBookMapRepository = userBookMapRepository;
    }

    public List<UserBookMapEntity> getAllBooks() {
        List<UserBookMapEntity> all = userBookMapRepository.findAll();
        all.stream().forEach(item -> {

        });
        return all;
    }
}
