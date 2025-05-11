package org.hk.flixly.service;

import org.hk.flixly.model.ActivityDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.UserActivityEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class UserActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final UserBookMapRepository userBookMapRepository;

    public UserActivityService(ActivityRepository activityRepository, UserRepository userRepository, UserBookMapRepository userBookMapRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.userBookMapRepository = userBookMapRepository;
    }

    public UserActivityEntity createActivity(ActivityDto activityDto, UserDetails userDetails) {
        UserEntity user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userDetails.getUsername()));

        UserActivityEntity entity = new UserActivityEntity();
        entity.setUserId(user.getId());
        entity.setBookId(activityDto.getBookId());
        entity.setRating(activityDto.getRating());
        entity.setComment(activityDto.getComment());
        entity.setReadDate(activityDto.getReadDate());
        entity.setStatus(activityDto.getStatus());
        activityRepository.save(entity);

        UserBookMapEntity userBookMapEntity = new UserBookMapEntity();
        userBookMapEntity.setUserId(user.getId());
        userBookMapEntity.setBookId(activityDto.getBookId());
        userBookMapEntity.setStatus(activityDto.getStatus());
        userBookMapRepository.save(userBookMapEntity);
        return entity;
    }
}
