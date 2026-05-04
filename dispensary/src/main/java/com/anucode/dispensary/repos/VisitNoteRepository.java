package com.anucode.dispensary.repos;

import com.anucode.dispensary.entities.VisitNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VisitNoteRepository extends JpaRepository<VisitNote, UUID> {

    List<VisitNote> findByVisitIdOrderByRecordedAtAsc(UUID visitId);
}
