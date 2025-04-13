package org.hk.flixly.service;

import org.hk.flixly.model.entity.BookEntity;
import org.hk.flixly.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public List<BookEntity> getAllBooks() {
        return activityRepository.findAll();
    }
}
