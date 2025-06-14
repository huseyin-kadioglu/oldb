package org.hk.flixly.repository;

import org.hk.flixly.model.entity.BookApprovalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookApprovalRepository extends JpaRepository<BookApprovalEntity, Long> {

}
