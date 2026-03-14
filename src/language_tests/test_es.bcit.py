# Hello World in Spanish
print("¡Hola Mundo! (Hello World)")

def saludar(nombre):
    if nombre == "BCIT":
        return "¡Bienvenidos al Hackathon!"
    else:
        return "Hola, " + nombre

print(saludar("BCIT"))

try:
    for i in range(3):
        print("Conteo:", i)
except:
    print("¡Ocurrió un error!")