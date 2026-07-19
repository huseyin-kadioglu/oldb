package org.hk.flixly.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "bio")
    private String bio;

    @Column(name = "location")
    private String location;


    /** USER | PRO | MODERATOR | ADMIN — bkz. {@link org.hk.flixly.model.enums.UserRole} */
    private String role;
    private int contributionPoint;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "pending_avatar_url", columnDefinition = "TEXT")
    private String pendingAvatarUrl;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private Date createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Date updatedAt;

    @Column(nullable = false)
    private String fullName;

    @Column(name = "page_per_day")
    private double pagePerDay;

    /** Yıllık kitap okuma hedefi (null = belirlenmemiş) */
    @Column(name = "yearly_book_goal")
    private Integer yearlyBookGoal;

    /** Profilde sergilenen tek rozet kodu (null = yok); yalnızca kazanılmış rozetler seçilebilir */
    @Column(name = "featured_badge_code", length = 64)
    private String featuredBadgeCode;

    @Column(name = "status", nullable = false)
    private boolean status = false;

    @Column(name = "activation_token", unique = true)
    private String activationToken;

    @Column(name = "token_expiry")
    private LocalDateTime tokenExpiry;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    public String getProfilName() {
        return this.username;
    }
}