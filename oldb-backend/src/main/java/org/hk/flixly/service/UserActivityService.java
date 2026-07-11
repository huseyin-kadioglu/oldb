package org.hk.flixly.service;

import org.hk.flixly.model.ActivityDto;
import org.hk.flixly.model.UserEntity;
import org.hk.flixly.model.entity.UserActivityEntity;
import org.hk.flixly.model.entity.UserBookMapEntity;
import org.hk.flixly.model.enums.BookActivityStatus;
import org.hk.flixly.repository.ActivityRepository;
import org.hk.flixly.repository.UserBookMapRepository;
import org.hk.flixly.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class UserActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final UserBookMapRepository userBookMapRepository;
    private final NotificationService notificationService;

    public UserActivityService(
            ActivityRepository activityRepository,
            UserRepository userRepository,
            UserBookMapRepository userBookMapRepository,
            NotificationService notificationService) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.userBookMapRepository = userBookMapRepository;
        this.notificationService = notificationService;
    }

    public UserActivityEntity createActivity(ActivityDto activityDto, UserDetails userDetails) {
        UserEntity user = getUserEntity(userDetails);
        Long userId = user.getId();
        Long bookId = activityDto.getBookId();
        String status = activityDto.getStatus();

        resolveStatusConflicts(userId, bookId, status);

        Optional<UserActivityEntity> existingActivity =
                activityRepository.findByUserIdAndBookIdAndStatus(userId, bookId, status);

        UserActivityEntity entity = existingActivity.orElseGet(UserActivityEntity::new);
        entity.setUserId(userId);
        entity.setBookId(bookId);
        entity.setRating(activityDto.getRating());
        entity.setComment(activityDto.getComment());
        entity.setReadDate(activityDto.getReadDate());
        entity.setStatus(status);
        entity.setUpdateDate(LocalDate.now());
        activityRepository.save(entity);

        Optional<UserBookMapEntity> existingMap =
                userBookMapRepository.findByUserIdAndBookIdAndStatus(userId, bookId, status);

        UserBookMapEntity map = existingMap.orElseGet(UserBookMapEntity::new);
        map.setUserId(userId);
        map.setBookId(bookId);
        map.setStatus(status);
        if (BookActivityStatus.LIBRARY.equals(status) && activityDto.getLibraryFormat() != null) {
            map.setLibraryFormat(activityDto.getLibraryFormat());
        }
        if (activityDto.getCurrentPage() != null) {
            map.setCurrentPage(activityDto.getCurrentPage());
        }
        userBookMapRepository.save(map);

        if (BookActivityStatus.READ.equals(status) || BookActivityStatus.COMPLETED.equals(status)) {
            notificationService.notifySameBookReaders(userId, bookId);
        }

        return entity;
    }

    public UserActivityEntity createActivityFromGhostMenu(ActivityDto activityDto, UserDetails userDetails) {
        UserEntity user = getUserEntity(userDetails);
        Long userId = user.getId();
        Long bookId = activityDto.getBookId();
        String actionType = activityDto.getActionType();

        Optional<UserBookMapEntity> mapEntity = userBookMapRepository.findByUserIdAndBookIdAndStatus(userId, bookId, actionType);
        if (mapEntity.isPresent()) {
            UserActivityEntity removed = removeActivity(mapEntity.get());
            return removed != null ? removed : stubActivity(userId, bookId, actionType);
        }

        resolveStatusConflicts(userId, bookId, actionType);
        return addActivity(userId, bookId, actionType, activityDto.getLibraryFormat());
    }

    private static UserActivityEntity stubActivity(Long userId, Long bookId, String status) {
        UserActivityEntity stub = new UserActivityEntity();
        stub.setUserId(userId);
        stub.setBookId(bookId);
        stub.setStatus(status);
        stub.setUpdateDate(LocalDate.now());
        return stub;
    }

    /**
     * Okuma durumu (READ/READLIST/DROPPED) birbirini dışlar.
     * Okunan kitap kütüphanede kalabilir; bırakılan kitap okunmuş veya kütüphanede olamaz.
     */
    private void resolveStatusConflicts(Long userId, Long bookId, String newStatus) {
        if (BookActivityStatus.isExclusiveReading(newStatus)) {
            for (String exclusive : BookActivityStatus.EXCLUSIVE_READING) {
                if (!exclusive.equals(newStatus)) {
                    removeStatusIfExists(userId, bookId, exclusive);
                }
            }
            if (BookActivityStatus.DROPPED.equals(newStatus)) {
                removeStatusIfExists(userId, bookId, BookActivityStatus.LIBRARY);
            }
        } else if (BookActivityStatus.LIBRARY.equals(newStatus)) {
            removeStatusIfExists(userId, bookId, BookActivityStatus.DROPPED);
        }
    }

    private void removeStatusIfExists(Long userId, Long bookId, String status) {
        userBookMapRepository.findByUserIdAndBookIdAndStatus(userId, bookId, status)
                .ifPresent(this::removeActivity);
    }

    private UserActivityEntity addActivity(Long userId, Long bookId, String status, String libraryFormat) {
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
        if (BookActivityStatus.LIBRARY.equals(status) && libraryFormat != null) {
            map.setLibraryFormat(libraryFormat);
        }
        userBookMapRepository.save(map);

        if (BookActivityStatus.READ.equals(status) || BookActivityStatus.COMPLETED.equals(status)) {
            notificationService.notifySameBookReaders(userId, bookId);
        }

        return activity;
    }

    private UserActivityEntity removeActivity(UserBookMapEntity entity) {
        Optional<UserActivityEntity> existingActivity = activityRepository.findByUserIdAndBookIdAndStatus(
                entity.getUserId(), entity.getBookId(), entity.getStatus());

        existingActivity.ifPresent(activityRepository::delete);
        userBookMapRepository.delete(entity);

        return existingActivity.orElse(null);
    }

    private UserEntity getUserEntity(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userDetails.getUsername()));
    }
}
