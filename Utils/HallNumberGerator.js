function HallNumberGerator() {
    var caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var resultado = '';
  
    for (var i = 0; i < 8; i++) {
      var indice = Math.floor(Math.random() * caracteres.length);
      resultado += caracteres.charAt(indice);
    }
  
    return resultado;
}

module.exports = HallNumberGerator