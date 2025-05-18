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

import java.time.LocalDate;
import java.util.Optional;

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
        UserEntity user = getUserEntity(userDetails);

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

    public UserActivityEntity createActivityFromGhostMenu(ActivityDto activityDto, UserDetails userDetails) {

        UserEntity user = getUserEntity(userDetails);
        Long userId = user.getId();
        Long bookId = activityDto.getBookId();
        String actionType = activityDto.getActionType();

        Optional<UserBookMapEntity> mapEntity = userBookMapRepository.findByUserIdAndBookIdAndStatus(userId, bookId, actionType);
        if (mapEntity.isPresent()) {
            return removeActivity(mapEntity.get());
        } else {
            return addActivity(userId, bookId, actionType);
        }
    }

    private UserActivityEntity addActivity(Long userId, Long bookId, String status) {
        UserActivityEntity activity = new UserActivityEntity();
        activity.setUserId(userId);
        activity.setBookId(bookId);
        activity.setStatus(status);
        activity.setUpdateDate(LocalDate.now());
        activityRepository.save(activity);

        UserBookMapEntity map = new UserBookMapEntity();
        map.setUserId(userId);
        map.setBookId(bookId);
        map.setStatus(status);
        userBookMapRepository.save(map);

        return activity;
    }

    private UserActivityEntity removeActivity(UserBookMapEntity entity) {
        Optional<UserActivityEntity> existingActivity = activityRepository.findByUserIdAndBookIdAndStatus(entity.getUserId(), entity.getBookId(), entity.getStatus());

        existingActivity.ifPresent(activityRepository::delete);

        userBookMapRepository.delete(entity);

        return existingActivity.orElse(null);
    }

    private UserEntity getUserEntity(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userDetails.getUsername()));
    }
}
