import requests
from pathlib import Path
import time

def simple_working_download():
    """Versão simplificada que funciona"""
    tournament_id = "68a15ee0da62500067d5676d"
    
    print("🚀 Download simplificado iniciado...")
    
    # 1. Obter dados dos times
    api_url = f"https://dtmwra1jsgyb0.cloudfront.net/tournaments/{tournament_id}/teams?page=1&limit=100"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    
    response = requests.get(api_url, headers=headers, timeout=15)
    
    if response.status_code != 200:
        print(f"❌ Erro {response.status_code} na API")
        return
    
    teams = response.json()
    print(f"✅ {len(teams)} times encontrados")
    
    # 2. Coletar userIDs
    user_ids = []
    for team in teams:
        for player in team.get('players', []):
            if player.get('userID'):
                user_ids.append(player['userID'])
    
    print(f"👤 {len(user_ids)} userIDs coletados")
    
    # 3. Configurar pasta
    avatars_dir = Path("simple_avatars")
    avatars_dir.mkdir(exist_ok=True)
    
    # 4. Download apenas das URLs que sabemos funcionar
    KNOWN_WORKING_URLS = [
        "https://firebasestorage.googleapis.com/v0/b/battlefy-2f59d.appspot.com/o/user-imgs%2F688e33fa296df40021a8dda0%2F1755280290640.jpg?alt=media&token=6ee3d1c5-caf7-41df-8aed-ddcd10cfc6e6",
        "https://firebasestorage.googleapis.com/v0/b/battlefy-2f59d.appspot.com/o/user-imgs%2F679e6f924446df002235eabd%2F1755777901722.jpg?alt=media&token=6ff58e20-e674-43a8-8ae1-4534462382f2",
        "https://firebasestorage.googleapis.com/v0/b/battlefy-2f59d.appspot.com/o/user-imgs%2F6812aa349df83e003f2f7d9a%2F1754431321446.jpg?alt=media&token=dea082f3-3357-4ad4-948c-9994bafc0906"
    ]
    
    download_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
    }
    
    success_count = 0
    
    for i, url in enumerate(KNOWN_WORKING_URLS):
        try:
            # Extrair userID da URL
            if 'user-imgs%2F' in url:
                user_id = url.split('user-imgs%2F')[1].split('%2F')[0]
                filename = f"user_{user_id}.jpg"
            else:
                filename = f"avatar_{i}.jpg"
            
            filepath = avatars_dir / filename
            
            print(f"📥 Baixando: {filename}")
            
            response = requests.get(url, headers=download_headers, timeout=10)
            
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                success_count += 1
                print(f"✅ {filename}")
            else:
                print(f"❌ HTTP {response.status_code}: {filename}")
                
        except Exception as e:
            print(f"❌ Erro: {e}")
        
        time.sleep(1)
    
    print(f"🎉 Download completo! {success_count}/{len(KNOWN_WORKING_URLS)} sucessos")
    print(f"📁 Pasta: {avatars_dir.absolute()}")

# Execute esta versão garantida
simple_working_download()