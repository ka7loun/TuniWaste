# Recyclability Percentage Detection using YOLO

## 📌 Project Overview

This project presents an AI-based computer vision model that detects waste items from a given image and estimates the **percentage of recyclability** of the detected content. The model is designed to support sustainability and smart waste management initiatives by providing an intuitive recyclability score along with a clear, human-readable message.

The project was developed as part of the **IEEE SIGHT Tunisia Section Challenge** within **TSYP**, with a focus on humanitarian and environmental impact.

---

## ♻️ Objective

The main objectives of this project are:

* Detect waste objects from an input image
* Classify waste types using a state-of-the-art object detection model
* Compute an overall **recyclability percentage** based on detected objects
* Display an interpretable phrase describing the recyclability level of the image content

---

## 🧠 Model & Dataset

### 🔹 Model Architecture

* **YOLO (You Only Look Once)** object detection framework
* Optimized for real-time detection and high accuracy

### 🔹 Dataset: ReCoDeWaste

This project is built upon the **ReCoDeWaste (Recycling Construction & Demolition Waste)** dataset, the first open-source **RGB-D dataset** specifically designed for multiwaste analysis in real-world recycling and material recovery scenarios.

**Key characteristics:**

* **2,505 high-resolution RGB-D images** collected from active construction sites in Melbourne, Australia
* **100,000+ manually annotated object instance masks**
* Designed to capture **clutter, occlusion, deformation, and contamination**, reflecting real-world CDW streams
* Released alongside a peer-reviewed publication in *Waste Management (2025)*

Unlike traditional RGB-only datasets, ReCoDeWaste includes **depth information**, which enhances boundary detection, spatial understanding, and robustness in complex waste environments.

### ♻️ Recyclable Classes

The dataset includes six primary recyclable waste classes used by this model:

* **Aggregates** – Concrete, rocks, stones, and bricks recycled as construction aggregates
* **Cardboard** – Deformed cardboard packaging recycled into paperboard and cellulose fibre
* **Hard Plastic (HDPE)** – Plumbing waste, containers, conduits, and rigid plastic materials
* **Metal** – Copper, aluminium, steel, and iron with high recycling value
* **Soft Plastic (LDPE)** – Plastic bags, wraps, and flexible packaging with high recyclability rates
* **Timber** – Waste wood recycled into furnishings, panel boards, and biomass

Each detected class contributes to the final recyclability score based on its recyclability potential.


## ⚙️ How It Works

1. An image is provided as input to the model
2. YOLO detects and classifies waste objects in the image
3. Each detected class is assigned a predefined recyclability weight
4. A **global recyclability percentage** is calculated based on all detections
5. The system outputs:

   * Bounding boxes and labels
   * Recyclability percentage
   * A descriptive phrase reflecting the recyclability level

---

## 🗨️ Recyclability Interpretation

Based on the computed percentage, the model displays a contextual message such as:

* **80–100%**: *"Highly recyclable content detected. Great job supporting sustainability!"*
* **50–79%**: *"Moderately recyclable materials detected. Some items can be recycled."*
* **20–49%**: *"Low recyclability. Consider better waste sorting."*
* **0–19%**: *"Non-recyclable waste detected. Recycling is not recommended."*

This makes the output understandable for both technical and non-technical users.

---

## 📊 Example Inference Output

```text
Original Image Shape: (720, 1280)
Inference Time: ~7.6 ms
Preprocess Time: ~2.0 ms
Postprocess Time: ~1.6 ms
Output Directory: runs/detect/predict
```

The detected objects are used to compute the final recyclability score and generate the corresponding phrase.

---

## 🛠️ Technologies Used

* Python
* YOLO (Ultralytics)
* OpenCV
* NumPy
* ReCoDeWaste Dataset

---

## 🌍 Impact & Use Cases

* Smart waste sorting systems
* Environmental awareness applications
* Educational tools for sustainability
* Support for circular economy initiatives

---

## 🚀 Future Improvements

* Integration with mobile or web applications
* Expansion to video-based detection
* Dynamic recyclability scoring using material composition
* Localization and multilingual support

---

## 🤝 Acknowledgments

* ReCoDeWaste Dataset contributors
* Ultralytics YOLO community

---

## 📜 License

This project is intended for educational and research purposes. Licensing details can be added based on deployment needs.

---

## 📬 Contact

For questions, collaboration, or feedback, feel free to reach out through IEEE channels or GitHub issues.

*Developed with a commitment to sustainability and humanitarian technology.* 🌱
