const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.middlewares();
    this.routes();
    this.databaseConnection();
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  routes() {
    this.app.get("/", (req, res) => {
      res.send("Servidor funcionando correctamente");
    });

    this.app.post("/citas", this.createCita);
    this.app.get("/citas", this.getAllCitas);
    this.app.get("/citas/:id", this.getCitaById);
    this.app.put("/citas/:id", this.updateCita);
    this.app.delete("/citas/:id", this.deleteCita);
  }

  async databaseConnection() {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Conexión exitosa a MongoDB");
    } catch (error) {
      console.error("Error al conectar a MongoDB:", error);
    }
  }

  async createCita(req, res) {
    try {
      const { nombre, correo, fecha, hora, descripcion } = req.body;
      const nuevaCita = new Cita({ nombre, correo, fecha, hora, descripcion });
      const citaGuardada = await nuevaCita.save();
      res.status(201).json(citaGuardada);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllCitas(req, res) {
    try {
      const citas = await Cita.find();
      res.status(200).json(citas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCitaById(req, res) {
    try {
      const cita = await Cita.findById(req.params.id);
      if (!cita) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }
      res.status(200).json(cita);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateCita(req, res) {
    try {
      const citaActualizada = await Cita.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!citaActualizada) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }
      res.status(200).json(citaActualizada);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCita(req, res) {
    try {
      const citaEliminada = await Cita.findByIdAndDelete(req.params.id);
      if (!citaEliminada) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }
      res.status(200).json({ message: "Cita eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Iniciar el servidor
  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor compilado en ${this.port}`);
    });
  }
}
const CitaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  descripcion: { type: String },
});
const Cita = mongoose.model("Cita", CitaSchema);
const server = new App();
server.listen();