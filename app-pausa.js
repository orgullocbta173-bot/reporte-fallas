```javascript
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxMmePmMCwL4I8g_Y5SrOivgODN-PjYnQ5F5xByeNOfI3X5mbv9jIHLKm7oimyYPs5P-Q/exec";

document.getElementById('screenshotFile').addEventListener('change', function(e) {
    const fileFeedback = document.getElementById('fileFeedback');
    if (e.target.files && e.target.files.length > 0) {
        fileFeedback.innerText = "Archivo seleccionado: " + e.target.files[0].name;
    } else {
        fileFeedback.innerText = "Formatos PNG, JPG hasta 10MB";
    }
});

const convertToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // Extrae solo la cadena base64 limpia
    reader.onerror = (error) => reject(error);
});

document.getElementById('failureReportForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = "Procesando y enviando...";

    const currentTimestamp = new Date();
    const reportDate = currentTimestamp.toLocaleDateString('es-MX');
    const reportTime = currentTimestamp.toLocaleTimeString('es-MX');

    const fileInput = document.getElementById('screenshotFile');
    const file = fileInput.files && fileInput.files.length > 0 ? fileInput.files[0] : null;
    
    const payload = {
        fecha: reportDate,
        hora: reportTime,
        nombre: document.getElementById('userName').value,
        rol: document.getElementById('userRole').value,
        edificio: document.getElementById('schoolBuilding').value,
        dispositivo: document.getElementById('deviceType').value,
        marca: document.getElementById('deviceBrand').value,
        modelo: document.getElementById('deviceModel').value,
        sistemaOperativo: document.getElementById('deviceOS').value,
        problemaPrincipal: document.querySelector('input[name="mainProblem"]:checked').value,
        aQuienesAfecta: document.querySelector('input[name="scope"]:checked').value,
        plataformaAfectada: document.getElementById('targetPlatform').value,
        mensajeError: document.getElementById('errorMessage').value || "Ninguno",
        archivoBase64: null,
        archivoNombre: null,
        archivoTipo: null
    };

    try {
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert("La imagen excede los 10MB permitidos.");
                submitBtn.disabled = false;
                submitBtn.innerText = "Enviar Reporte de Falla";
                return;
            }
            payload.archivoBase64 = await convertToBase64(file);
            payload.archivoNombre = `Falla_${payload.nombre.replace(/\s+/g, '_')}_${Date.now()}.${file.name.split('.').pop()}`;
            payload.archivoTipo = file.type;
        }

        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        alert(`¡Reporte registrado con éxito!\nFecha: ${reportDate}\nHora: ${reportTime}`);
        this.reset();
        document.getElementById('fileFeedback').innerText = "Formatos PNG, JPG hasta 10MB";
        
    } catch (error) {
        console.error(error);
        alert("Ocurrió un error al enviar tu reporte.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Enviar Reporte de Falla";
    }
});