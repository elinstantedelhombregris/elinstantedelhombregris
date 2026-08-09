"""A generated blocklist of conjugated Spanish verb forms.

`concepts.py` needs to reject conjugated verbs ("PASA", "FALTA", "ESTAS",
"ESPERABAMOS", "PENSALO" were real examples that leaked into on-screen
keywords) while keeping ordinary nouns, even ones that share a surface or
suffix with a verb form (e.g. "estado", "cuidado", "sentido" are common nouns
that are *also* participles -- they must not be blocked).

Rather than guess from suffixes alone (regular participle endings like
"-ado"/"-ido" collide with too many ordinary nouns to use as a blanket
filter), this module builds an explicit *set of actual conjugated forms* for
a curated list of common Spanish verbs, normalised the same way the rest of
the studio normalises text (lowercase, accents stripped -- see
`ascii_studio.text.normalized_words`). A candidate word is rejected only if
it exactly matches a generated form.

Two sources feed the set:

1. A regular-conjugation generator applied to ~150 common -ar/-er/-ir verb
   infinitives (covers present/preterite/imperfect/future/conditional/
   present-subjunctive indicative persons, gerund, and voseo/tú imperative
   with the common enclitic pronouns attached, e.g. "pensa" + "lo" ->
   "pensalo"). Stem-changing/irregular verbs conjugated through this
   generator produce some forms that are not real Spanish (harmless -- they
   just never match anything) alongside the ones that happen to be regular
   (e.g. "pasar" -> "pasa", "faltar" -> "falta", "esperar" -> "esperabamos").
2. A hardcoded table of real forms for the ~20 highest-frequency irregular
   verbs (ser, estar, tener, hacer, ir, poder, decir, ver, dar, saber,
   querer, poner, venir, salir, haber), since a regular-conjugation guess for
   these produces forms that do not exist in Spanish and would miss the
   ones that actually show up in prose ("es", "fue", "esta", "tiene",
   "hizo", ...).

Deliberately excluded: bare infinitives and participles are NOT blocked
(an infinitive like "poder" or a participle-turned-noun like "estado" is
common enough as a nominal in Spanish prose that blocking it would cost more
concepts than it saves ambiguity); only *personal* conjugated forms and
gerunds are generated.
"""

from __future__ import annotations

from functools import lru_cache

from ascii_studio.text import strip_accents

# --- regular verb infinitives -----------------------------------------------
# Common in Argentine civic/essay-style Spanish. Includes several irregular
# verbs too (their regularly-generated forms are mostly noise, but a handful
# happen to be real -- e.g. "pensar" -> "penso" is wrong, but does no harm;
# the real irregular forms for the highest-frequency verbs are added
# separately below).
_REGULAR_AR = [
    "pasar", "faltar", "esperar", "cambiar", "buscar", "crear", "generar",
    "necesitar", "activar", "despertar", "escuchar", "hablar",
    "llevar", "llamar", "tomar", "tratar", "mirar", "contar", "empezar",
    "trabajar", "usar", "olvidar", "imaginar", "guardar",
    "celebrar", "aceptar", "realizar", "explicar", "preguntar", "tocar",
    "estudiar", "alcanzar", "utilizar", "pagar", "ayudar",
    "gustar", "jugar", "intentar", "avanzar",
    "conectar", "transformar", "integrar", "aplicar", "sentar",
    "adorar", "delegar", "administrar", "capturar", "disfrutar",
    "abrazar", "consagrar", "resucitar", "quedar",
    "cerrar", "negar", "mostrar", "acabar", "ganar",
    "formar", "pensar", "confiar", "cortar", "diseñar",
    "levantar", "apagar", "soltar",
    "cuidar", "curar", "sanar", "sonar", "amar", "odiar", "juzgar",
    "castigar", "premiar", "votar", "gobernar", "ejecutar",
    "reformar", "mapear", "diagnosticar",
    "rediseñar", "priorizar", "coordinar",
    "evitar", "disfrazar", "iluminar", "tolerar",
    "escalar", "consolidar", "articular", "propagar",
    "multiplicar", "aumentar", "acelerar", "frenar",
    "iniciar", "abandonar", "recuperar", "reparar",
    "importar", "significar", "resultar", "lograr", "afectar", "marcar",
]
_REGULAR_ER = [
    "deber", "perder", "entender", "mover", "volver", "conocer", "leer",
    "creer", "comprender", "aprender", "vender", "ceder", "romper",
    "responder", "temer", "ofender", "prometer", "meter", "correr",
    "comer", "beber", "esconder", "encender", "obedecer", "sostener",
    "detener",
    "parecer", "resolver",
]
_REGULAR_IR = [
    "vivir", "sentir", "seguir", "servir", "existir", "escribir", "recibir",
    "descubrir", "permitir", "conseguir", "construir", "dirigir", "elegir",
    "producir", "reprimir", "resistir", "insistir", "persistir", "cumplir",
    "dividir", "unir", "abrir", "surgir", "sumergir", "decidir", "repetir",
    "definir", "ungir", "resurgir", "convertir", "corregir", "medir",
    "intervenir", "reducir", "traducir", "conducir", "introducir",
]

_ENCLITICS = ["", "lo", "la", "los", "las", "le", "les", "se", "me", "te", "nos"]


def _strip(word: str) -> str:
    return strip_accents(word).lower()


def _conjugate_ar(stem: str) -> set[str]:
    forms = {
        # presente
        stem + "o", stem + "as", stem + "a", stem + "amos", stem + "an",
        # preterito
        stem + "e", stem + "aste", stem + "o", stem + "amos", stem + "aron",
        # imperfecto
        stem + "aba", stem + "abas", stem + "abamos", stem + "aban",
        # futuro (on infinitive)
        stem + "ar" + "e", stem + "ar" + "as", stem + "ar" + "a",
        stem + "ar" + "emos", stem + "ar" + "an",
        # condicional
        stem + "ar" + "ia", stem + "ar" + "ias", stem + "ar" + "iamos",
        stem + "ar" + "ian",
        # presente subjuntivo
        stem + "e", stem + "es", stem + "emos", stem + "en",
        # gerundio
        stem + "ando",
    }
    for clitic in _ENCLITICS:
        forms.add(stem + "a" + clitic)  # imperativo voseo/tu regular
    return forms


def _conjugate_er_ir(stem: str, infinitive_ending: str) -> set[str]:
    forms = {
        stem + "o", stem + "es", stem + "e", stem + "emos", stem + "en",
        stem + "i", stem + "iste", stem + "io", stem + "imos", stem + "ieron",
        stem + "ia", stem + "ias", stem + "iamos", stem + "ian",
        stem + infinitive_ending + "e", stem + infinitive_ending + "as",
        stem + infinitive_ending + "a", stem + infinitive_ending + "emos",
        stem + infinitive_ending + "an",
        stem + infinitive_ending + "ia", stem + infinitive_ending + "ias",
        stem + infinitive_ending + "iamos", stem + infinitive_ending + "ian",
        stem + "a", stem + "as", stem + "amos", stem + "an",
        stem + "iendo",
    }
    if infinitive_ending == "ir":
        forms.add(stem + "is")  # voseo present, -ir verbs ("sentis", "vivis")
    for clitic in _ENCLITICS:
        forms.add(stem + "e" + clitic)
    return forms


# --- irregular verbs: hardcoded real forms ----------------------------------
_IRREGULAR_FORMS = {
    "ser": {
        "soy", "eres", "sos", "es", "somos", "sois", "son", "fui", "fuiste",
        "fue", "fuimos", "fueron", "era", "eras", "eramos", "eran", "sere",
        "seras", "sera", "seremos", "seran", "seria", "serias", "seriamos",
        "serian", "sea", "seas", "seamos", "sean", "siendo", "sido",
    },
    "estar": {
        "estoy", "estas", "esta", "estamos", "estan", "estuve", "estuviste",
        "estuvo", "estuvimos", "estuvieron", "estaba", "estabas",
        "estabamos", "estaban", "estare", "estaras", "estara", "estaremos",
        "estaran", "estaria", "estarian", "este", "estes", "estemos",
        "esten", "estando",
    },
    "tener": {
        "tengo", "tienes", "tenes", "tiene", "tenemos", "tienen", "tuve",
        "tuviste", "tuvo", "tuvimos", "tuvieron", "tenia", "tenias",
        "teniamos", "tenian", "tendre", "tendras", "tendra", "tendremos",
        "tendran", "tendria", "tendrian", "tenga", "tengas", "tengan", "teniendo",
    },
    "hacer": {
        "hago", "haces", "hace", "hacemos", "hacen", "hice", "hiciste",
        "hizo", "hicimos", "hicieron", "hacia", "hacias", "haciamos",
        "hacian", "hare", "haras", "hara", "haremos", "haran", "haria",
        "harian", "haga", "hagan", "haciendo",
    },
    "ir": {
        "voy", "vas", "va", "vamos", "van", "iba", "ibas", "ibamos", "iban",
        "ire", "iras", "ira", "iremos", "iran", "vaya", "vayan", "yendo",
    },
    "poder": {
        "puedo", "puedes", "podes", "puede", "podemos", "pueden", "pude",
        "pudiste", "pudo", "pudimos", "pudieron", "podia", "podias",
        "podiamos", "podian", "podre", "podras", "podra", "podremos",
        "podran", "podria", "podrias", "podriamos", "podrian", "pudiendo",
        "pueda", "puedas", "podamos", "puedan",
    },
    "decir": {
        "digo", "dices", "decis", "dice", "decimos", "dicen", "dije",
        "dijiste", "dijo", "dijimos", "dijeron", "decia", "decias",
        "deciamos", "decian", "dire", "diras", "dira", "diremos", "diran",
        "diria", "dirian", "diciendo", "dicho",
    },
    "ver": {
        "veo", "ves", "ve", "vemos", "ven", "vi", "viste", "vio", "vimos",
        "vieron", "veia", "veias", "veiamos", "veian", "viendo", "visto",
    },
    "dar": {
        "doy", "das", "da", "damos", "dan", "di", "diste", "dio", "dimos",
        "dieron", "daba", "dabas", "dabamos", "daban", "dando",
    },
    "saber": {
        "se", "sabes", "sabe", "sabemos", "saben", "supe", "supiste",
        "supo", "supimos", "supieron", "sabia", "sabias", "sabiamos",
        "sabian", "sabre", "sabras", "sabra", "sabremos", "sabran",
        "sabiendo",
    },
    "querer": {
        "quiero", "quieres", "queres", "quiere", "queremos", "quieren",
        "quise", "quisiste", "quiso", "quisimos", "quisieron", "queria",
        "querias", "queriamos", "querian", "querre", "querras", "querra",
        "querremos", "querran", "queriendo",
    },
    "poner": {
        "pongo", "pones", "pone", "ponemos", "ponen", "puse", "pusiste",
        "puso", "pusimos", "pusieron", "ponia", "ponias", "poniamos",
        "ponian", "pondre", "pondras", "pondra", "pondremos", "pondran",
        "poniendo", "puesto",
    },
    "venir": {
        "vengo", "vienes", "venis", "viene", "venimos", "vienen", "vine",
        "viniste", "vino", "vinimos", "vinieron", "venia", "venias",
        "veniamos", "venian", "vendre", "vendras", "vendra", "vendremos",
        "vendran", "viniendo",
    },
    "salir": {
        "salgo", "sales", "sale", "salimos", "salen", "sali", "saliste",
        "salio", "salimos", "salieron", "salia", "salias", "saliamos",
        "salian", "saldre", "saldras", "saldra", "saldremos", "saldran",
        "saliendo",
    },
    "haber": {
        "he", "has", "ha", "hay", "hemos", "han", "hube", "hubiste", "hubo",
        "hubimos", "hubieron", "habia", "habias", "habiamos", "habian",
        "habre", "habras", "habra", "habremos", "habran", "habiendo",
        "habido",
    },
    "contar": {
        "cuento", "cuentas", "cuenta", "contamos", "cuentan", "conte",
        "contaste", "conto", "contaron", "contaba", "contaban", "contando",
    },
    "construir": {
        "construyo", "construyes", "construye", "construimos", "construyen",
        "construi", "construiste", "construyo", "construyeron", "construyendo",
    },
    "sonar": {
        "sueno", "suenas", "suena", "sonamos", "suenan", "sono", "sonaron", "sonando",
    },
    # Stem-changing -ir verbs where the naive regular-conjugation generator
    # (unchanged stem) misses the real, changed-stem forms that actually
    # show up in prose -- "mide"/"miden" (medir), not the regularly-guessed
    # "mede"/"meden".
    "medir": {
        "mido", "mides", "medis", "mide", "medimos", "miden", "medi",
        "mediste", "midio", "midieron", "media", "medias", "mediamos",
        "median", "midiendo",
    },
    "pedir": {
        "pido", "pides", "pedis", "pide", "pedimos", "piden", "pedi",
        "pediste", "pidio", "pidieron", "pedia", "pedias", "pediamos",
        "pedian", "pidiendo",
    },
    "servir": {
        "sirvo", "sirves", "servis", "sirve", "servimos", "sirven", "servi",
        "serviste", "sirvio", "sirvieron", "servia", "servias", "serviamos",
        "servian", "sirviendo",
    },
    "seguir": {
        "sigo", "sigues", "seguis", "sigue", "seguimos", "siguen", "segui",
        "seguiste", "siguio", "siguieron", "seguia", "seguias", "seguiamos",
        "seguian", "siguiendo",
    },
    "elegir": {
        "elijo", "eliges", "elegis", "elige", "elegimos", "eligen", "elegi",
        "elegiste", "eligio", "eligieron", "elegia", "elegias", "elegiamos",
        "elegian", "eligiendo",
    },
    "corregir": {
        "corrijo", "corriges", "corregis", "corrige", "corregimos",
        "corrigen", "corregi", "corregiste", "corrigio", "corrigieron",
        "corregia", "corregias", "corregiamos", "corregian", "corrigiendo",
    },
}

# Compound verbs built on an irregular base ("sostener" = "sos" + "tener",
# "intervenir" = "inter" + "venir"): every hardcoded form of the base verb,
# reprefixed. Covers the highest-frequency compounds without hand-writing
# each paradigm again.
_COMPOUND_IRREGULARS = {
    "sostener": ("tener", "sos"),
    "detener": ("tener", "de"),
    "mantener": ("tener", "man"),
    "contener": ("tener", "con"),
    "obtener": ("tener", "ob"),
    "intervenir": ("venir", "inter"),
    "convenir": ("venir", "con"),
    "prevenir": ("venir", "pre"),
    "componer": ("poner", "com"),
    "proponer": ("poner", "pro"),
    "suponer": ("poner", "su"),
    "disponer": ("poner", "dis"),
    "exponer": ("poner", "ex"),
}

# The "-ducir" family shares one irregular pattern: c->zc in yo-present, and
# an irregular "duj" preterite stem ("redujo", not the regularly-guessed
# "reducio"). "reducir" showing up unblocked in a real article
# ("...cultura ciudadana redujo la violencia...") is what surfaced this gap.
_DUCIR_PREFIXES = ["pro", "re", "tra", "con", "intro"]


def _ducir_forms(prefix: str) -> set[str]:
    return {
        prefix + "duzco", prefix + "duces", prefix + "duce",
        prefix + "ducimos", prefix + "ducen", prefix + "duje",
        prefix + "dujiste", prefix + "dujo", prefix + "dujimos",
        prefix + "dujeron", prefix + "ducia", prefix + "ducias",
        prefix + "duciamos", prefix + "ducian", prefix + "duciendo",
        # presente de subjuntivo ("produzca", "reduzcan", ...), a common
        # argumentative form that otherwise leaked into visual concepts.
        prefix + "duzca", prefix + "duzcas", prefix + "duzcamos",
        prefix + "duzcan",
    }


@lru_cache(maxsize=1)
def conjugated_forms() -> frozenset[str]:
    """All generated/hardcoded conjugated Spanish verb forms, normalised
    (lowercase, accents stripped) so they can be compared directly against
    tokens produced by `ascii_studio.text.normalized_words`.

    Deliberately excludes bare infinitives and past participles -- see the
    module docstring for why.
    """
    forms: set[str] = set()
    for infinitive in _REGULAR_AR:
        forms.update(_conjugate_ar(_strip(infinitive)[:-2]))
    for infinitive in _REGULAR_ER:
        forms.update(_conjugate_er_ir(_strip(infinitive)[:-2], "er"))
    for infinitive in _REGULAR_IR:
        forms.update(_conjugate_er_ir(_strip(infinitive)[:-2], "ir"))
    for form_set in _IRREGULAR_FORMS.values():
        forms.update(_strip(form) for form in form_set)
    for base, prefix in _COMPOUND_IRREGULARS.values():
        forms.update(prefix + _strip(form) for form in _IRREGULAR_FORMS[base])
    for prefix in _DUCIR_PREFIXES:
        forms.update(_ducir_forms(prefix))
    return frozenset(forms)


def is_conjugated_verb(word: str) -> bool:
    return _strip(word) in conjugated_forms()
