from django.http import JsonResponse

def teste(request):
    return JsonResponse({"message": "Conexão entre Django e React funcionando!"})
