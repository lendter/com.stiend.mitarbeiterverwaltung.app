package com.stiend.mitarbeiterverwaltung.app.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.stiend.mitarbeiterverwaltung.app.helper.DocumentStorageProperty;
import com.stiend.mitarbeiterverwaltung.app.helper.Serialisation;

import cli.*;
import jakarta.annotation.PostConstruct;
import verwaltung.*;

@RestController()
@RequestMapping("/verwaltung/api")
public class VerwaltungController {
	private VerwaltungHandler handler;
	private Serialisation serializer;
	
	@Value( "${document.upload-directory}" )
	private String property;
	
	@PostConstruct
	public void init() {
		this.serializer = new Serialisation(property);
		if(serializer.loadState() != null) {
			Abteilung abteilung = serializer.loadState();
			handler = new VerwaltungHandler(abteilung);
		}else {
			Manager manager = new Manager(5001, "Peter Lustig", 10000, 0.1);
			Abteilung abteilung = new Abteilung("Development", manager);
			handler = new VerwaltungHandler(abteilung);
		}
	}
	
	@GetMapping("/gehaltsliste")
	public String getGehaltsliste() {
		return handler.getGehaltsListe();
	}
	
	@GetMapping("/mitarbeiter")
	public List<Mitarbeiter> getMitarbeiter() {
		return handler.getMitarbeiter();
	}
	
	@GetMapping("/schichtarbeiter")
	public List<SchichtArbeiter> getSchichtarbeiter() {
		List<SchichtArbeiter> schichtarbeiter = new ArrayList();
		List<Mitarbeiter> arbeiterList = handler.getMitarbeiter();
		for(Mitarbeiter arbeiter : arbeiterList) {
			if(arbeiter.getClass().equals(SchichtArbeiter.class)) {
				schichtarbeiter.add((SchichtArbeiter)arbeiter);
			}
		}
		return schichtarbeiter;
	}
	
	@GetMapping("/manager")
	public Manager getManager() {
		return handler.getAbteilung().getLeiter();
	}
	
	@GetMapping("/abteilungName")
	public String getAbteilungName() {
		return handler.getAbteilung().getName();
	}
	
	@PostMapping("/addBueroArbeiter")
	public void addBueroArbeiter(@RequestBody BueroArbeiter arbeiter) {
		handler.addBueroMitarbeiter(arbeiter);
		this.saveState();
	}
	
	@PostMapping("/addSchichtArbeiter")
	public void addSchichtArbeiter(@RequestBody SchichtArbeiter arbeiter) {
		handler.addSchichtArbeiter(arbeiter);
		this.saveState();
	}

	@PostMapping("/changeManager")
	public void changeManager(@RequestBody Manager manager) {
		handler.wechselManager(manager);
		this.saveState();
	}
	
	@DeleteMapping("/delete/mitarbeiter/{id}")
	public void removeMitarbeiter(@PathVariable(name = "id") Integer id) {
		handler.removeMitarbeiterById(id);
		this.saveState();
	}
	
	@PostMapping("/schicht/mitarbeiter/{id}/{stunden}")
	public void addSchichtForArbeiter(@PathVariable(name = "id") Integer id, @PathVariable(name = "stunden") Integer stunden) {
		String name = handler.getAbteilung().findById(id).getName();
		handler.trageArbeitEin(name, stunden);
		this.saveState();
	}
	
	private void saveState() {
		serializer.saveState(handler.getAbteilung());
	}
}
