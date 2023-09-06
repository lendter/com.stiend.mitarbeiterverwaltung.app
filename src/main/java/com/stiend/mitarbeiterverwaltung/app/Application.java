package com.stiend.mitarbeiterverwaltung.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.stiend.mitarbeiterverwaltung.app.controller.VerwaltungController;

import jakarta.annotation.PostConstruct;
import verwaltung.*;

@SpringBootApplication
public class Application {
	
	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
