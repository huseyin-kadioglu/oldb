package org.hk.flixly.repository;

import org.hk.flixly.model.entity.AuthorApprovalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorApprovalRepository extends JpaRepository<AuthorApprovalEntity, Long> {

}
