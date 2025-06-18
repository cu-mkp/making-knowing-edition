#!/usr/bin/env python3
"""
Thumbnail Checker for Making and Knowing Edition

This script specifically validates all essay thumbnails, checking both
local files and S3 URLs for accessibility and proper configuration.
"""

import json
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import sys


class ThumbnailChecker:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.annotations_dir = self.base_dir / "public" / "bnf-ms-fr-640" / "staging061825-0" / "annotations"
        self.thumbnails_dir = self.base_dir / "public" / "bnf-ms-fr-640" / "staging061825-0" / "annotations-thumbnails"
        self.issues = []
        self.stats = {
            'total_essays': 0,
            'local_thumbnails': 0,
            's3_thumbnails': 0,
            'accessible_thumbnails': 0,
            'missing_thumbnails': 0,
            'broken_urls': 0
        }
        
    def log_issue(self, severity: str, essay_id: str, issue: str):
        """Log a thumbnail issue"""
        self.issues.append({
            'severity': severity,
            'essay_id': essay_id,
            'issue': issue,
            'timestamp': datetime.now().isoformat()
        })
        
    def load_annotations(self) -> Optional[List[Dict]]:
        """Load annotations from manifest"""
        manifest_path = self.annotations_dir / "annotations.json"
        
        if not manifest_path.exists():
            print(f"❌ Annotations manifest not found: {manifest_path}")
            return None
            
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('content', [])
        except Exception as e:
            print(f"❌ Error loading annotations: {e}")
            return None
            
    def check_local_thumbnail(self, thumbnail_name: str) -> bool:
        """Check if local thumbnail file exists"""
        thumbnail_path = self.thumbnails_dir / thumbnail_name
        return thumbnail_path.exists()
        
    def check_s3_thumbnail(self, url: str, timeout: int = 10) -> bool:
        """Check if S3 thumbnail URL is accessible"""
        try:
            response = requests.head(url, timeout=timeout, allow_redirects=True)
            return response.status_code == 200
        except requests.RequestException:
            return False
            
    def get_thumbnail_info(self, annotation: Dict) -> Dict:
        """Get comprehensive thumbnail information for an essay"""
        essay_id = annotation.get('id', 'unknown')
        
        info = {
            'essay_id': essay_id,
            'title': annotation.get('name', 'Unknown Title'),
            'data_source': annotation.get('dataSource', 'unknown'),
            'has_local_thumbnail': False,
            'local_thumbnail': None,
            'local_thumbnail_exists': False,
            'has_s3_thumbnail': False,
            's3_thumbnail_url': None,
            's3_thumbnail_accessible': False,
            'thumbnail_working': False,
            'fallback_to_watermark': False
        }
        
        # Check local thumbnail
        if 'thumbnail' in annotation and annotation['thumbnail']:
            info['has_local_thumbnail'] = True
            info['local_thumbnail'] = annotation['thumbnail']
            info['local_thumbnail_exists'] = self.check_local_thumbnail(annotation['thumbnail'])
            
        # Check S3 thumbnail
        if 's3ThumbUrl' in annotation and annotation['s3ThumbUrl']:
            info['has_s3_thumbnail'] = True
            info['s3_thumbnail_url'] = annotation['s3ThumbUrl']
            info['s3_thumbnail_accessible'] = self.check_s3_thumbnail(annotation['s3ThumbUrl'])
            
        # Determine which thumbnail should be used based on dataSource
        data_source = annotation.get('dataSource', 'gh')
        
        if data_source == 'gh':
            # GitHub essays should use S3 thumbnails
            info['thumbnail_working'] = info['s3_thumbnail_accessible']
            if not info['thumbnail_working']:
                info['fallback_to_watermark'] = True
        else:
            # Google Drive essays should use local thumbnails
            info['thumbnail_working'] = info['local_thumbnail_exists']
            if not info['thumbnail_working']:
                info['fallback_to_watermark'] = True
                
        return info
        
    def audit_thumbnails(self) -> Dict:
        """Audit all essay thumbnails"""
        print("🖼️  Starting thumbnail audit...")
        
        annotations = self.load_annotations()
        if not annotations:
            return {'success': False, 'error': 'Could not load annotations'}
            
        self.stats['total_essays'] = len(annotations)
        print(f"📚 Checking thumbnails for {len(annotations)} essays...")
        
        results = []
        
        for i, annotation in enumerate(annotations, 1):
            essay_id = annotation.get('id', f'unknown_{i}')
            print(f"  [{i:3d}/{len(annotations)}] Checking {essay_id}...")
            
            info = self.get_thumbnail_info(annotation)
            results.append(info)
            
            # Update statistics
            if info['has_local_thumbnail']:
                self.stats['local_thumbnails'] += 1
            if info['has_s3_thumbnail']:
                self.stats['s3_thumbnails'] += 1
            if info['thumbnail_working']:
                self.stats['accessible_thumbnails'] += 1
            else:
                self.stats['missing_thumbnails'] += 1
                
            # Log issues
            if not info['has_local_thumbnail'] and not info['has_s3_thumbnail']:
                self.log_issue('ERROR', essay_id, "No thumbnail configuration found")
            elif info['has_local_thumbnail'] and not info['local_thumbnail_exists']:
                self.log_issue('ERROR', essay_id, f"Local thumbnail file missing: {info['local_thumbnail']}")
            elif info['has_s3_thumbnail'] and not info['s3_thumbnail_accessible']:
                self.log_issue('WARNING', essay_id, f"S3 thumbnail not accessible: {info['s3_thumbnail_url']}")
                self.stats['broken_urls'] += 1
                
        return {
            'success': True,
            'stats': self.stats,
            'issues': self.issues,
            'results': results,
            'timestamp': datetime.now().isoformat()
        }
        
    def generate_report(self, audit_results: Dict) -> str:
        """Generate thumbnail audit report"""
        if not audit_results['success']:
            return f"❌ Thumbnail audit failed: {audit_results.get('error', 'Unknown error')}"
            
        stats = audit_results['stats']
        issues = audit_results['issues']
        results = audit_results['results']
        
        # Calculate percentages
        total = stats['total_essays']
        working_pct = (stats['accessible_thumbnails'] / total * 100) if total > 0 else 0
        
        report = f"""
# Thumbnail Audit Report
**Generated:** {audit_results['timestamp']}

## 📊 Summary Statistics
- **Total Essays:** {stats['total_essays']}
- **Working Thumbnails:** {stats['accessible_thumbnails']} ({working_pct:.1f}%)
- **Local Thumbnails:** {stats['local_thumbnails']}
- **S3 Thumbnails:** {stats['s3_thumbnails']}
- **Missing/Broken Thumbnails:** {stats['missing_thumbnails']}
- **Broken S3 URLs:** {stats['broken_urls']}

## 🔍 Thumbnail Distribution by Source
"""
        
        # Group by data source
        gh_essays = [r for r in results if r.get('data_source') == 'gh']
        gdrive_essays = [r for r in results if r.get('data_source') == 'gdrive']
        
        report += f"""
### GitHub Essays ({len(gh_essays)})
- Should use S3 thumbnails from `edition-assets.makingandknowing.org`
- Working: {sum(1 for r in gh_essays if r['thumbnail_working'])}
- Broken: {sum(1 for r in gh_essays if not r['thumbnail_working'])}

### Google Drive Essays ({len(gdrive_essays)})
- Should use local thumbnail files
- Working: {sum(1 for r in gdrive_essays if r['thumbnail_working'])}
- Broken: {sum(1 for r in gdrive_essays if not r['thumbnail_working'])}
"""
        
        # List issues
        if issues:
            report += f"\n## 🚨 Issues Found ({len(issues)} total)\n"
            
            errors = [i for i in issues if i['severity'] == 'ERROR']
            warnings = [i for i in issues if i['severity'] == 'WARNING']
            
            if errors:
                report += f"\n### ❌ Errors ({len(errors)})\n"
                for issue in errors:
                    report += f"- **{issue['essay_id']}**: {issue['issue']}\n"
                    
            if warnings:
                report += f"\n### ⚠️ Warnings ({len(warnings)})\n"
                for issue in warnings:
                    report += f"- **{issue['essay_id']}**: {issue['issue']}\n"
        else:
            report += "\n✅ **No thumbnail issues found!**\n"
            
        # Local files inventory
        if self.thumbnails_dir.exists():
            local_files = list(self.thumbnails_dir.glob('*.jpg')) + list(self.thumbnails_dir.glob('*.jpeg')) + list(self.thumbnails_dir.glob('*.png'))
            report += f"""
## 📁 Local Thumbnail Files ({len(local_files)})
"""
            for file in sorted(local_files):
                size_kb = file.stat().st_size // 1024
                report += f"- `{file.name}` ({size_kb} KB)\n"
                
        return report


def main():
    """Main entry point"""
    checker = ThumbnailChecker()
    
    print("🦎 Making and Knowing Edition - Thumbnail Checker")
    print("=" * 50)
    
    # Run audit
    results = checker.audit_thumbnails()
    
    # Generate report
    report = checker.generate_report(results)
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = Path(__file__).parent / f"thumbnail_results_{timestamp}.json"
    report_file = Path(__file__).parent / f"thumbnail_report_{timestamp}.md"
    
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
        
    print("\n" + "=" * 50)
    print("🖼️  THUMBNAIL AUDIT COMPLETE")
    print("=" * 50)
    print(report)
    print(f"\n💾 Results saved to: {results_file}")
    print(f"📄 Report saved to: {report_file}")
    
    # Exit with appropriate code
    if results['success'] and len(checker.issues) == 0:
        print("\n✅ All thumbnails are working!")
        sys.exit(0)
    else:
        print(f"\n⚠️ Found {len(checker.issues)} thumbnail issues")
        sys.exit(1)


if __name__ == "__main__":
    main()