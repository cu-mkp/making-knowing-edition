#!/usr/bin/env python3

import requests
import json

essay_id = 'ann_316_ie_19'
print(f'Checking thumbnail for {essay_id}...')

try:
    with open('../public/bnf-ms-fr-640/staging061825-0/annotations/annotations.json', 'r') as f:
        data = json.load(f)
        essays = data.get('content', [])
        essay = next((e for e in essays if e.get('id') == essay_id), None)
        
        if essay:
            print(f'Essay found: {essay.get("fullTitle", "No title")}')
            s3_url = essay.get('s3ThumbUrl', 'No s3ThumbUrl')
            print(f's3ThumbUrl: {s3_url}')
            
            if s3_url and s3_url != 'No s3ThumbUrl':
                print('Testing thumbnail URL...')
                response = requests.head(s3_url, timeout=10)
                print(f'Status: {response.status_code}')
                if response.status_code != 200:
                    print('❌ Thumbnail URL is broken!')
                    # Try to get more info
                    try:
                        get_response = requests.get(s3_url, timeout=10)
                        print(f'GET Status: {get_response.status_code}')
                    except:
                        pass
                else:
                    print('✅ Thumbnail URL works!')
            else:
                print('❌ No s3ThumbUrl found in data')
        else:
            print('❌ Essay not found in annotations data')
            
except Exception as e:
    print(f'❌ Error: {e}')