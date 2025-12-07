// Automatyczne formatowanie pól formularza

// Formatowanie kodu pocztowego (00-000)
function formatPostalCode(input) {
    let value = input.value.replace(/\D/g, ''); // Usuń wszystko oprócz cyfr
    
    if (value.length > 2) {
        value = value.substring(0, 2) + '-' + value.substring(2, 5);
    }
    
    input.value = value;
}

// Formatowanie numeru telefonu (123-456-789)
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, ''); // Usuń wszystko oprócz cyfr
    
    if (value.length > 3 && value.length <= 6) {
        value = value.substring(0, 3) + '-' + value.substring(3);
    } else if (value.length > 6) {
        value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6, 9);
    }
    
    input.value = value;
}

// Formatowanie PESEL (123-45-67890)
function formatPesel(input) {
    let value = input.value.replace(/\D/g, ''); // Usuń wszystko oprócz cyfr
    
    if (value.length > 3 && value.length <= 5) {
        value = value.substring(0, 3) + '-' + value.substring(3);
    } else if (value.length > 5) {
        value = value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5, 11);
    }
    
    input.value = value;
}

// Formatowanie NIP (123-456-78-90 lub 123-45-67-890)
function formatNip(input) {
    let value = input.value.replace(/\D/g, ''); // Usuń wszystko oprócz cyfr
    
    if (value.length <= 10) {
        // Format: 123-456-78-90
        if (value.length > 3 && value.length <= 6) {
            value = value.substring(0, 3) + '-' + value.substring(3);
        } else if (value.length > 6 && value.length <= 8) {
            value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
        } else if (value.length > 8) {
            value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6, 8) + '-' + value.substring(8, 10);
        }
    }
    
    input.value = value;
}

// Inicjalizacja formatowania po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
    // Kod pocztowy
    const postalInputs = document.querySelectorAll('#clientPostal, #casePostal');
    postalInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                formatPostalCode(this);
            });
            input.setAttribute('placeholder', '00-000');
            input.setAttribute('maxlength', '6');
        }
    });
    
    // Telefon
    const phoneInputs = document.querySelectorAll('#clientPhone, #casePhone');
    phoneInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                formatPhoneNumber(this);
            });
            input.setAttribute('placeholder', '123-456-789');
            input.setAttribute('maxlength', '11');
        }
    });
    
    // PESEL
    const peselInputs = document.querySelectorAll('#clientPesel');
    peselInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                formatPesel(this);
            });
            input.setAttribute('placeholder', '123-45-67890');
            input.setAttribute('maxlength', '13');
        }
    });
    
    // NIP
    const nipInputs = document.querySelectorAll('#clientNip');
    nipInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                formatNip(this);
            });
            input.setAttribute('placeholder', '123-456-78-90');
            input.setAttribute('maxlength', '13');
        }
    });
});

// Funkcja do usuwania formatowania przed wysłaniem (jeśli potrzebne)
function removeFormatting(value) {
    return value.replace(/\D/g, '');
}

// Eksportuj funkcje
window.formatters = {
    formatPostalCode,
    formatPhoneNumber,
    formatPesel,
    formatNip,
    removeFormatting
};
