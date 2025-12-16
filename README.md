# ReCoDeWaste-Recyclable-vs-Non-Recyclable-Detection

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

### 🔹 Dataset

* **ReCoDeWaste Dataset**
* Contains labeled images of various waste categories relevant to recycling and waste sorting

The dataset was used to train and evaluate the model for accurate waste detection and classification.

---

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

* **IEEE SIGHT Tunisia Section**
* **IEEE TSYP**
* ReCoDeWaste Dataset contributors
* Ultralytics YOLO community

---

## 📜 License

This project is intended for educational and research purposes. Licensing details can be added based on deployment needs.

---

## 📬 Contact

For questions, collaboration, or feedback, feel free to reach out.

*Developed with a commitment to sustainability and humanitarian technology.* 🌱

