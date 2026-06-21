package org.hk.flixly.model.enums;


public enum ReadingStatus {
    READING,        // Kullanıcı kitabı okumakta
    COMPLETED,      // Kullanıcı kitabı bitirdi
    DROPPED,        // Kullanıcı kitabı yarıda bıraktı
    WANT_TO_READ    // Kullanıcı kitabı okumak istiyor
}