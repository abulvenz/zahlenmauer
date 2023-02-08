# zahlenmauer
Ein Programm für Erstklässler. Live-Version gibt es [hier](https://abulvenz.github.io/zahlenmauer/).

## Regeln
Die "Zahlenmauer" ist so aufgebaut, dass von einer Startebene mit `N` Elementen nach oben hin jede Zeile immer ein Element weniger hat, bis nur noch ein Element in der obersten Reihe der Mauer übrig ist. In jedem Stein der Mauer soll als Lösung die Summe der beiden Zahlen darunter stehen.

Sieht zum Beispiel die Lösung so aus
```
   8
  4 4
 3 1 3
3 0 1 2
```
lässt man mehrere Zahlen aus, um die Aufgabe zu erstellen:

```
   8
  _ _
 _ _ 3
_ 0 1 _
```
Die Aufgabe lässt sich nun vorwärts lösen, in dem man sukzessive die Aufgaben löst, für die man zwei Zahlen schon kennt. Hier kann man zuerst `0 + 1 = ?` und `1 + ? = 3` lösen.
```
   8
  _ _
 _ 1 3
_ 0 1 2
```
Jetzt `1 + 3 = ?`
```
   8
  _ 4
 _ 1 3
_ 0 1 2
```
dann `? + 4 = 8`
```
   8
  4 4
 _ 1 3
_ 0 1 2
```
dann `? + 1 = 4`
```
   8
  4 4
 3 1 3
_ 0 1 2
```
und schließlich `? + 0 = 3`
```
   8
  4 4
 3 1 3
3 0 1 2
```
Damit hat ein Mensch die Aufgabe gelöst. Wie lässt sich jedoch eine Aufgabe automatisch erzeugen?
## Erzeugen neuer Aufgaben

Definiert man nun Variablen für die freien Plätze könnte man schreiben:
```
   8
  a b
 c d 3
e 0 1 f
```
Aus der Aufgabenstellung ergeben sich nun Gleichungen für die Unbekannten:
```
8 = a + b
a = c + d
b = d + 3
c = e + 0
d = 0 + 1
3 = 1 + f
```
6 Gleichungen, 6 Unbekannte, das klingt doch schon mal gut.
Beschreibt man den allgemeinen Fall, ergibt sich folgendes Schema für die ganze Mauer:
```
   a
  b c
 d e f
g h i j

a = b + c
b = d + e
c = e + f
d = g + h
e = h + i
f = i + j
```
Formuliert man das Gleichungssystem als Matrix, wäre das
```
  | a  b  c  d  e  f  g  h  i  j
--+------------------------------
a | 1 -1 -1  0  0  0  0  0  0  0
b | 0  1  0 -1 -1  0  0  0  0  0
c | 0  0  1  0 -1 -1  0  0  0  0
d | 0  0  0  1  0  0 -1 -1  0  0
e | 0  0  0  0  1  0  0 -1 -1  0
f | 0  0  0  0  0  1  0  0 -1 -1
```
als Gleichungen die sich aufgrund der Nachbarschaft in der Mauer ergeben.
6 Gleichungen für 10 Unbekannte, da fehlen ja noch vier. Ach, das sind ja die Gleichungen, die sich durch das Vorgeben von Feldern erzeugen lassen. Wir müssen also vier Zahlen angeben.

Das heißt eine Möglichkeit immer eine gültige Zahlenwand anzugeben wäre, die unterste Zeile mit Zahlen zu füllen und dann nach oben hin die Aufgaben zu lösen. Allerdings muss man dann nur "Plus-Rechnen" und nicht "Wieviel-Aufgaben" lösen.
Die unterste Zeile enthält immer die gleiche Anzahl an Elementen wie die Höhe der Mauer. In unserem Beispiel ist die Höhe der Mauer `4`, die unterste Zeile enthält auch `4` Elemente.

Die Anzahl `A` der Gleichungen für eine Mauer der Höhe `N` ist also 
$$A = \sum_{i=1}^{N-1}{i} = \frac{N(N-1)}{2}$$

Wenn man jetzt `N` beliebige Elemente für die Mauer vorgibt, müsste es doch eine Lösung geben. Leider ja, aber diese Lösung wäre im Bereich der rationalen Zahlen zu suchen. Also werden wir uns hier nicht mit den Problemen der [diophantischen Gleichungen](https://de.wikipedia.org/wiki/Diophantische_Gleichung) herumplagen, sondern den oben genannten Ansatz zur Erzeugung einer ganzzahligen Mauer nutzen und dann einfach Felder weglassen so dass die Mauer lösbar bleibt.

Kann man beliebige Felder angeben, so dass das System lösbar ist? Tatsächlich ist die Anzahl der angegebenen Zahlen das einzig entscheidende bei der Lösbarkeit der Mauer, da die Gleichungen mit denen Zahlen vorgegeben werden immer linear unabhängig voneinander und von den anderen Gleichungen sind, solange man unterschiedliche Felder wählt (Beweis: Hausaufgabe für den Leser:). Leider gibt es noch ein Problem. Das zeige ich mal an diesem Beispiel (gleiche Zahlenmauer wie das Eingangsbeispiel):
```
   8
  4 4
 3 1 3
3 0 1 2
```
wo wir vier Felder auswählen:
```
   8
  _ _
 _ 1 _
3 _ _ 2
```
Keine der sechs "Grundschulaufgaben" ist direkt lösbar:
```
8 = a + b
a = c + 1
b = 1 + d
1 = e + f
c = 3 + e
d = f + 2
```
Alle Gleichungen haben für sich betrachtet 2 Unbekannte. Das heißt, man müsste Gleichungen umformen oder mehrere Aufgaben zugleich betrachten um die gesamte Mauer zu lösen. 

Um eine Mauer zu erzeugen, die mit den einfachen Möglichkeiten der Grundschüler lösbar ist, kann man zwei Wege beschreiten: Entweder man führt eine Erreichbarkeitsanalyse durch oder man löst die Aufgaben mit den Mitteln, die den Grundschülern zur Verfügung stehen und schaut, ob sich so eine Lösung ergibt. Implementiert ist gerade das letztere Vorgehen. Das andere wäre sicherlich auch interessant.

Es ergibt sich der folgende Algorithmus zum Finden der Aufgabe:

### Sub-Algorithmus Solve(Mauer): Lösungen finden, wenn das Problem definiert ist:
1. Solange noch Aufgaben A = B + C gefunden werden, in denen exakt zwei Bekannte stecken, ermittle die fehlende Variable mit
    - wenn A unbekannt: A = B + C
    - wenn B unbekannt: B = A - C
    - wenn C unbekannt: C = A - B
2. Trage das Ergebnis ein
3. Gehe zu 1.
4. Wenn alle Felder belegt sind ist die Aufgabe gelöst sonst ist sie nicht lösbar (Mit den "Grundschulmethoden")


### Algorithmus: Finden der Aufgabe der Höhe `N`:
1. Erzeuge eine Zahlenmauer $M_{korrekt}$ der Höhe `N` in dem die unterste Reihe mit Zufallszahlen gefüllt ist und der Rest leer ist.
2. Würfle `N` Positionen $P_i, i = \{1..N\}$ aus und erzeuge eine Zahlenmauer $M_{kandidat}$ mit den Werten aus $M_{korrekt}$ an den Positionen $P_i$.
3. Solange der der Sub-Algorithmus Solve($M_{kandidat}$) nicht die Lösung bestätigt hat, gehe zu 2.
