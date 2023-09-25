package com.stiend.mitarbeiterverwaltung.app.helper;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import mitarbeiter.BueroArbeiter;
import mitarbeiter.Manager;
import mitarbeiter.SchichtArbeiter;
import model.Mitarbeiter;
import verwaltung.Abteilung;

public class Serialisation {
	private String filePath;
	private Gson gson;

	public Serialisation(String property) {
		this.filePath = Paths.get(property).toAbsolutePath() + "/file.json";
		this.gson = new GsonBuilder().create();
	}

	public void saveState(Abteilung abteilung) {
		String jsonString = gson.toJson(abteilung);
		try {
			FileWriter myWriter = new FileWriter(filePath);
			myWriter.write(jsonString);
			myWriter.close();
			System.out.println("Successfully wrote to the file.");
		} catch (IOException e) {
			System.out.println("An error occurred.");
			e.printStackTrace();
		}
	}

	public Abteilung loadState() {
		File initialFile = new File(filePath);
		try {
			InputStream targetStream = new FileInputStream(initialFile);
			String result = readFileFromInputStream(targetStream);
			JsonObject json = gson.fromJson(result, JsonObject.class);
			return createAbteilung(json);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}

	private Abteilung createAbteilung(JsonObject json) {
		String name = json.get("name").getAsString();
		JsonArray mitarbeiter = json.get("mitarbeiter").getAsJsonArray();
		JsonObject leiter = json.get("leiter").getAsJsonObject();
		Abteilung abteilung =  new Abteilung(name, getManagerFromJson(leiter));
		for (int i = 0; i < mitarbeiter.size(); i++) {
			JsonObject mitarbeiterObject = mitarbeiter.get(i).getAsJsonObject();
			abteilung.addMitarbeiter(getMitarbeiterFromJson(mitarbeiterObject));
		}
		return abteilung;
	}

	private Mitarbeiter getMitarbeiterFromJson(JsonObject json) {
		int id = json.get("id").getAsInt();
		String name = json.get("name").getAsString();
		if (id > 5100) {
			double festgehalt = json.get("festgehalt").getAsDouble();
			return new BueroArbeiter(id, name, festgehalt);
		} else if (id > 5000) {
			double festgehalt = json.get("festgehalt").getAsDouble();
			double bonusSatz = json.get("bonusSatz").getAsDouble();
			return new Manager(id, name, festgehalt, bonusSatz);
		} else {
			double stundenSatz = json.get("stundenSatz").getAsDouble();
			int anzahlStunden = json.get("anzahlStunden").getAsInt();
			SchichtArbeiter arbeiter = new SchichtArbeiter(id, name, stundenSatz);
			arbeiter.setAnzahlStunden(anzahlStunden);
			return arbeiter;
		}
	}

	private Manager getManagerFromJson(JsonObject json) {
		int id = json.get("id").getAsInt();
		String name = json.get("name").getAsString();
		double festgehalt = json.get("festgehalt").getAsDouble();
		double bonusSatz = json.get("bonusSatz").getAsDouble();
		return new Manager(id, name, festgehalt, bonusSatz);
	}

	private String readFileFromInputStream(InputStream inputStream) throws IOException {
		StringBuilder resultStringBuilder = new StringBuilder();
		try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
			String line;
			while ((line = br.readLine()) != null) {
				resultStringBuilder.append(line).append("\n");
			}
		}
		return resultStringBuilder.toString();
	}
}
